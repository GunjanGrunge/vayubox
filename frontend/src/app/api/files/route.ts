import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3Service';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folderId = formData.get('folderId') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create S3 key (path) for the file
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const s3Key = folderId ? `${folderId}/${fileName}` : fileName;
      
      // Upload to S3
      const fileUrl = await S3Service.uploadFile(buffer, s3Key, file.type);
      
      uploadedFiles.push({
        id: `file_${timestamp}_${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        s3Key: s3Key,
        folderId: folderId || null,
        uploadedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    // List files from S3
    const prefix = folderId ? `${folderId}/` : '';
    const s3Files = await S3Service.listFiles(prefix);
    
    const files = s3Files
      .filter((item): item is { Key?: string; Size?: number; LastModified?: Date } => 'Key' in item)
      .map((s3File) => ({
        id: `file_${s3File.Key}`,
        name: s3File.Key?.split('/').pop() || 'Unknown',
        size: s3File.Size || 0,
        type: 'application/octet-stream',
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3File.Key}`,
      s3Key: s3File.Key,
      folderId: folderId || null,
      uploadedAt: s3File.LastModified || new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s3Key = searchParams.get('s3Key');
    
    if (!s3Key) {
      return NextResponse.json(
        { success: false, message: 'S3 key is required' },
        { status: 400 }
      );
    }

    await S3Service.deleteFile(s3Key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, s3Key, newName, newFolderId } = await request.json();
    
    if (!s3Key) {
      return NextResponse.json(
        { success: false, message: 'S3 key is required' },
        { status: 400 }
      );
    }

    let newS3Key: string;

    if (action === 'rename') {
      if (!newName) {
        return NextResponse.json(
          { success: false, message: 'New name is required for rename' },
          { status: 400 }
        );
      }
      newS3Key = await S3Service.renameFile(s3Key, newName);
    } else if (action === 'move') {
      // Extract filename from current key
      const fileName = s3Key.split('/').pop() || 'unknown';
      newS3Key = newFolderId ? `${newFolderId}/${fileName}` : fileName;
      await S3Service.moveFile(s3Key, newS3Key);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `File ${action}d successfully`,
      newS3Key,
    });
  } catch (error) {
    console.error('File operation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to perform file operation' },
      { status: 500 }
    );
  }
}
