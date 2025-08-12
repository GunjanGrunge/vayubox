import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const path = searchParams.get('path') || '';

    console.log(`S3 GET - Action: ${action}, Path: ${path}`);

    if (action === 'list') {
      return await listObjects(path);
    } else if (action === 'download') {
      return await getDownloadUrl(path);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('S3 GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, fileName, folderPath, folderName, parentPath } = await request.json();

    console.log(`S3 POST - Action: ${action}`);

    if (action === 'upload') {
      return await getUploadUrl(fileName, folderPath);
    } else if (action === 'createFolder') {
      return await createFolder(folderName, parentPath);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('S3 POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    console.log(`S3 DELETE - Path: ${path}`);
    return await deleteObject(path);
  } catch (error) {
    console.error('S3 DELETE Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { action, oldPath, newName, sourcePath, destinationPath } = await request.json();

    console.log(`S3 PUT - Action: ${action}`);

    if (action === 'rename') {
      return await renameObject(oldPath, newName);
    } else if (action === 'move') {
      return await moveObject(sourcePath, destinationPath);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('S3 PUT Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function listObjects(folderPath: string) {
  try {
    const prefix = folderPath ? `${folderPath}/` : '';
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/',
    });

    const response = await s3Client.send(command);
    
    const folders = (response.CommonPrefixes || []).map(prefix => {
      const fullPrefix = prefix.Prefix!;
      const folderName = fullPrefix.slice(0, -1).split('/').pop()!;
      return {
        name: folderName,
        type: 'folder' as const,
        path: fullPrefix.slice(0, -1),
      };
    });

    const files = (response.Contents || [])
      .filter(obj => obj.Key !== prefix && !obj.Key!.endsWith('/'))
      .map(obj => ({
        name: obj.Key!.split('/').pop()!,
        type: 'file' as const,
        path: obj.Key!,
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString(),
      }));

    return NextResponse.json({ folders, files });
  } catch (error) {
    console.error('List objects error:', error);
    return NextResponse.json({ error: 'Failed to list objects' }, { status: 500 });
  }
}

async function getDownloadUrl(filePath: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Get download URL error:', error);
    return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
  }
}

async function getUploadUrl(fileName: string, folderPath?: string) {
  try {
    const key = folderPath ? `${folderPath}/${fileName}` : fileName;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return NextResponse.json({ url, key });
  } catch (error) {
    console.error('Get upload URL error:', error);
    return NextResponse.json({ error: 'Failed to get upload URL' }, { status: 500 });
  }
}

async function createFolder(folderName: string, parentPath?: string) {
  try {
    const key = parentPath ? `${parentPath}/${folderName}/` : `${folderName}/`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: '',
    });

    await s3Client.send(command);
    return NextResponse.json({ success: true, path: key.slice(0, -1) });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

async function deleteObject(objectPath: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectPath,
    });

    await s3Client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete object error:', error);
    return NextResponse.json({ error: 'Failed to delete object' }, { status: 500 });
  }
}

async function renameObject(oldPath: string, newName: string) {
  try {
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    // Copy to new location
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      Key: newPath,
      CopySource: `${BUCKET_NAME}/${oldPath}`,
    });

    await s3Client.send(copyCommand);

    // Delete old object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: oldPath,
    });

    await s3Client.send(deleteCommand);
    return NextResponse.json({ success: true, newPath });
  } catch (error) {
    console.error('Rename object error:', error);
    return NextResponse.json({ error: 'Failed to rename object' }, { status: 500 });
  }
}

async function moveObject(sourcePath: string, destinationPath: string) {
  try {
    // Copy to new location
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      Key: destinationPath,
      CopySource: `${BUCKET_NAME}/${sourcePath}`,
    });

    await s3Client.send(copyCommand);

    // Delete old object
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: sourcePath,
    });

    await s3Client.send(deleteCommand);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Move object error:', error);
    return NextResponse.json({ error: 'Failed to move object' }, { status: 500 });
  }
}
