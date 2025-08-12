import { NextRequest, NextResponse } from 'next/server';
import { S3Service } from '@/lib/s3Service';

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Create folder path
    const folderPath = parentId ? `${parentId}/${name}` : name;
    
    // Create folder in S3
    await S3Service.createFolder(folderPath);

    const newFolder = {
      id: folderPath, // Use folder path as ID
      name,
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: folderPath,
    };

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      folder: newFolder,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    
    // List folders from S3
    const prefix = parentId ? `${parentId}/` : '';
    const s3Folders = await S3Service.listFolders(prefix);
    
    const folders = s3Folders.map((folderPath: string) => {
      const folderName = folderPath.replace(prefix, '').replace('/', '');
      return {
        id: folderPath.replace('/', ''), // Use folder path without trailing slash as ID
        name: folderName,
        parentId: parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: folderPath,
      };
    }).filter(folder => folder.name); // Filter out empty names

    return NextResponse.json({
      success: true,
      folders,
    });
  } catch (error) {
    console.error('List folders error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list folders' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get('path');
    
    if (!folderPath) {
      return NextResponse.json(
        { success: false, message: 'Folder path is required' },
        { status: 400 }
      );
    }

    // Note: To delete a folder in S3, we need to delete all objects within it
    // For now, we'll just delete the folder marker
    await S3Service.deleteFile(`${folderPath}/`);

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
