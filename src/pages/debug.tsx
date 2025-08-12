import React from 'react';

const DebugPage = () => {
  const envVars = {
    hasAwsRegion: !!process.env.NEXT_PUBLIC_AWS_REGION,
    hasAwsAccessKey: !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    hasAwsSecretKey: !!process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    hasS3Bucket: !!process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    accessKeyLength: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID?.length,
    secretKeyLength: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY?.length,
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Environment Variables Debug</h1>
      
      <div className="bg-gray-900 p-6 rounded-lg">
        <h2 className="text-xl mb-4">Environment Variables Status:</h2>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      <div className="mt-8 bg-red-900 p-4 rounded-lg">
        <h3 className="text-lg mb-2">⚠️ Security Warning</h3>
        <p>This debug page exposes environment variable info. Remove it after debugging!</p>
      </div>
    </div>
  );
};

export default DebugPage;
