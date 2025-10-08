import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { Indexer } from '@0glabs/0g-ts-sdk';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ rootHash: string }> }
) {
  try {
    const { rootHash } = await params;

    const INDEXER_RPC = process.env.NEXT_PUBLIC_INDEXER_RPC!;
    const indexer = new Indexer(INDEXER_RPC);

    const downloadsDir = '/tmp';
    const outputPath = join(downloadsDir, `${rootHash}.file`);

    const fs = await import('fs');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const err = await indexer.download(rootHash, outputPath, true);
    
    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }

    const fileBuffer = fs.readFileSync(outputPath);
    
    fs.unlinkSync(outputPath);

    // Determine content type based on file extension or content
    const contentType = 'application/octet-stream'; // Default

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${rootHash}.file"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}