import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import OpenAI from "openai";

const OG_PROVIDER = process.env.LLAMA_PROVIDER!

function initializeOGServices() {
  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!;
  const rpcUrl =process.env.NEXT_PUBLIC_OG_RPC_URL!

  if (!privateKey) throw new Error("Missing PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  return { signer };
}

export async function POST(req: NextRequest) {
  try {
    const { vaultName, fileName, context } = await req.json();

    const { signer } = initializeOGServices();
    const broker = await createZGComputeNetworkBroker(signer);
    const providerAddress = OG_PROVIDER

    try {
      await broker.inference.acknowledgeProviderSigner(providerAddress);
    } catch {
      console.log("Provider already acknowledged or acknowledgment failed");
    }

    const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

    const prompt = `
    You are an AI content assistant.
    Analyze the context below and suggest:
    1. A descriptive, concise filename (no extension)
    2. A 1-2 sentence description
    3. 3-5 relevant tags

    Context:
    Vault: ${vaultName}
    File name: ${fileName}
    User input: ${context}

    Return JSON like:
    {
      "name": "...",
      "description": "...",
      "tagss": ["...", "..."]
    }
    `;

    const headers = await broker.inference.getRequestHeaders(providerAddress, prompt);
    const openai = new OpenAI({ baseURL: endpoint, apiKey: "" });

    const requestHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([k, v]) => {
      if (typeof v === "string") requestHeaders[k] = v;
    });

    const completion = await openai.chat.completions.create(
      {
        model,
        messages: [{ role: "user", content: prompt }],
      },
      { headers: requestHeaders }
    );

    const content = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(content);

    const isValid = await broker.inference.processResponse(
      providerAddress,
      content,
      completion.id
    );

    return NextResponse.json({
      success: true,
      metadata: parsed,
      valid: isValid,
      model,
    });
  } catch (err: any) {
    console.error("Metadata generation error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
