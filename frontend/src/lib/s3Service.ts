import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand, GetObjectCommand, _Object } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Type definitions
interface FileInfo {
  ContentLength?: number;
  ContentType?: string;
  LastModified?: Date;
  ETag?: string;
  Metadata?: Record<string, string>;
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
  // Add browser-specific configuration
  forcePathStyle: true,
  endpoint: undefined, // Use default AWS endpoint
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || 'awsdropbox101';

export class S3Service {
  // Upload file to S3
  static async uploadFile(file: Buffer | File, key: string, contentType: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await s3Client.send(command);
      return `https://${BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  // Delete file from S3
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  // List files in a folder
  static async listFiles(prefix: string = ''): Promise<(_Object | { Prefix?: string })[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      console.error('Error listing files from S3:', error);
      throw new Error('Failed to list files from S3');
    }
  }

  // List folders
  static async listFolders(prefix: string = ''): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
      });

      const response = await s3Client.send(command);
      return (response.CommonPrefixes || []).map(item => item.Prefix || '');
    } catch (error) {
      console.error('Error listing folders from S3:', error);
      throw new Error('Failed to list folders from S3');
    }
  }

  // Create folder (by uploading an empty file with folder name)
  static async createFolder(folderPath: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${folderPath}/`,
        Body: '',
        ContentType: 'application/x-directory',
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('Error creating folder in S3:', error);
      throw new Error('Failed to create folder in S3');
    }
  }

  // Get file info
  static async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      return response;
    } catch (error) {
      console.error('Error getting file info from S3:', error);
      throw new Error('Failed to get file info from S3');
    }
  }

  // Generate presigned URL for file access
  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  // Move file in S3 (copy and delete)
  static async moveFile(oldKey: string, newKey: string): Promise<void> {
    try {
      // Copy the object to the new location
      const copyCommand = new CopyObjectCommand({
        Bucket: BUCKET_NAME,
        CopySource: `${BUCKET_NAME}/${oldKey}`,
        Key: newKey,
      });
      
      await s3Client.send(copyCommand);
      
      // Delete the original object
      const deleteCommand = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: oldKey,
      });
      
      await s3Client.send(deleteCommand);
    } catch (error) {
      console.error('Error moving file in S3:', error);
      throw new Error('Failed to move file in S3');
    }
  }

  // Rename file in S3 (copy and delete with new name)
  static async renameFile(oldKey: string, newName: string): Promise<string> {
    try {
      // Extract the folder path from the old key
      const pathParts = oldKey.split('/');
      pathParts[pathParts.length - 1] = newName; // Replace filename with new name
      const newKey = pathParts.join('/');
      
      // Move the file to the new key
      await this.moveFile(oldKey, newKey);
      
      return newKey;
    } catch (error) {
      console.error('Error renaming file in S3:', error);
      throw new Error('Failed to rename file in S3');
    }
  }
}
