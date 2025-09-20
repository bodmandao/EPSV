import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useConfetti } from "@/hooks/useConfetti";
import { useAccount } from "wagmi";
import { preflightCheck } from "@/utils/preflightCheck";
import { useSynapse } from "@/providers/SynapseProvider";

export type UploadedInfo = {
  fileName?: string;
  fileSize?: number;
  pieceCid?: string;
  txHash?: string;
};

/**
 * Hook to upload a file to the Filecoin network using Synapse.
 */
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [uploadedInfo, setUploadedInfo] = useState<UploadedInfo | null>(null);
  const { synapse } = useSynapse();
  const { triggerConfetti } = useConfetti();
  const { address } = useAccount();
  
  const mutation = useMutation({
    mutationKey: ["file-upload", address],
    mutationFn: async (file: File) => {
      if (!synapse) throw new Error("Synapse not found");
      if (!address) throw new Error("Address not found");
      
      setProgress(0);
      setUploadedInfo(null);
      setStatus("🔄 Initializing file upload to Filecoin...");

      console.log("Starting upload process...");

      // Convert File → ArrayBuffer → Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8ArrayBytes = new Uint8Array(arrayBuffer);

      // Get dataset
      const datasets = await synapse.storage.findDataSets(address);
      const datasetExists = datasets.length > 0;
      const includeDatasetCreationFee = !datasetExists;

      // Preflight check
      setStatus("💰 Checking USDFC balance and storage allowances...");
      setProgress(5);
      await preflightCheck(
        file,
        synapse,
        includeDatasetCreationFee,
        setStatus,
        setProgress
      );

      setStatus("🔗 Setting up storage service and dataset...");
      setProgress(25);

      console.log("Creating storage service...");

      // Create storage service
      const storageService = await synapse.createStorage({
        callbacks: {
          onDataSetResolved: (info) => {
            console.log("Dataset resolved:", info);
            setStatus("🔗 Existing dataset found and resolved");
            setProgress(30);
          },
          onDataSetCreationStarted: (transactionResponse, statusUrl) => {
            console.log("Dataset creation started:", transactionResponse);
            console.log("Dataset creation status URL:", statusUrl);
            setStatus("🏗️ Creating new dataset on blockchain...");
            setProgress(35);
          },
          onDataSetCreationProgress: (status) => {
            console.log("Dataset creation progress:", status);
            if (status.transactionSuccess) {
              setStatus(`⛓️ Dataset transaction confirmed on chain`);
              setProgress(45);
            }
            if (status.serverConfirmed) {
              setStatus(
                `🎉 Dataset ready! (${Math.round(status.elapsedMs / 1000)}s)`
              );
              setProgress(50);
            }
          },
          onProviderSelected: (provider) => {
            console.log("Storage provider selected:", provider);
            setStatus(`🏪 Storage provider selected`);
          },
        },
      });

      setStatus("📁 Uploading file to storage provider...");
      setProgress(55);
      
      console.log("Starting file upload...");

      // Use a promise to handle the upload completion
      return new Promise<UploadedInfo>((resolve, reject) => {
        let finalPieceCid: string | undefined;
        let finalTxHash: string | undefined;
        let uploadCompleted = false;

        storageService.upload(uint8ArrayBytes, {
          onUploadComplete: (piece) => {
            console.log("onUploadComplete called with piece:", piece);
            setStatus(`📊 File uploaded! Signing msg to add pieces to the dataset`);
            
            const pieceCid = piece.toV1().toString();
            finalPieceCid = pieceCid;
            console.log("Piece CID:", pieceCid);
            
            setUploadedInfo((prev) => ({
              ...prev,
              fileName: file.name,
              fileSize: file.size,
              pieceCid: pieceCid,
            }));
            setProgress(80);
            uploadCompleted = true;
          },
          onPieceAdded: (transactionResponse) => {
            console.log("onPieceAdded called with:", transactionResponse);
            setStatus(
              `🔄 Waiting for transaction to be confirmed on chain${
                transactionResponse ? `(txHash: ${transactionResponse.hash})` : ""
              }`
            );
            if (transactionResponse) {
              console.log("Transaction response:", transactionResponse);
              finalTxHash = transactionResponse.hash;
              setUploadedInfo((prev) => ({
                ...prev,
                txHash: transactionResponse.hash,
              }));
            }

             resolve({
              fileName: file.name,
              fileSize: file.size,
              pieceCid: finalPieceCid,
              txHash: finalTxHash,
            });
          },
          // onPieceConfirmed: (pieceIds) => {
          //   console.log("onPieceConfirmed called with:", pieceIds);
          //   setStatus("🌳 Data pieces added to dataset successfully");
          //   setProgress(90);
            
          //   // Resolve when everything is complete
           
          // },
        }).catch((error) => {
          console.error("Upload error:", error);
          reject(error);
        });

        // Add a timeout as fallback in case callbacks don't fire
        setTimeout(() => {
          if (!uploadCompleted) {
            console.warn("Upload timeout - callbacks may not have fired");
            reject(new Error("Upload timeout - callbacks not received"));
          }
        }, 30000); // 30 second timeout
      });
    },
    onSuccess: (uploadedInfo) => {
      console.log("Upload successful with info:", uploadedInfo);
      setUploadedInfo(uploadedInfo);
      setStatus("🎉 File successfully stored on Filecoin!");
      setProgress(100);
      triggerConfetti();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setStatus(`❌ Upload failed: ${error.message || "Please try again"}`);
      setProgress(0);
    },
  });

  const handleReset = () => {
    setProgress(0);
    setUploadedInfo(null);
    setStatus("");
  };

  return {
    uploadFileMutation: mutation,
    progress,
    uploadedInfo,
    handleReset,
    status,
  };
};