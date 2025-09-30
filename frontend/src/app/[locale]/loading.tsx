'use client';


export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-pulse">
                    <div className="h-12 w-12 mx-auto bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-lg font-medium">Loading...</div>
            </div>
        </div>
    </div>
  );
}