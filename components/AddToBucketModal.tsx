import React, { useState, useEffect } from 'react';
import { Post, Bucket } from '../types';
import { XIcon, PlusIcon } from './Icons';
import * as db from '../contexts/services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

interface AddToBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onSaveChange: (postId: number, isSaved: boolean) => void;
}

const AddToBucketModal: React.FC<AddToBucketModalProps> = ({ isOpen, onClose, post, onSaveChange }) => {
  const { user } = useAuth();
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucketIds, setSelectedBucketIds] = useState<Set<number>>(new Set());
  const [newBucketName, setNewBucketName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuckets = async () => {
      if (isOpen && user && post) {
        setIsLoading(true);
        try {
          const [userBuckets, postBucketIds] = await Promise.all([
            db.getBucketsForUser(user.uid),
            db.getBucketsForPost(post.id, user.uid)
          ]);
          setBuckets(userBuckets);
          setSelectedBucketIds(new Set(postBucketIds));
        } catch (error) {
          console.error("Error fetching buckets:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchBuckets();
  }, [isOpen, user, post]);
  
  if (!isOpen || !post || !user) {
    return null;
  }

  const handleToggleBucket = async (bucketId: number) => {
    const originalSelectedIds = new Set(selectedBucketIds);
    const newSelectedIds = new Set(originalSelectedIds);
    const isCurrentlyInBucket = newSelectedIds.has(bucketId);

    // Optimistic UI update
    if (isCurrentlyInBucket) {
        newSelectedIds.delete(bucketId);
    } else {
        newSelectedIds.add(bucketId);
    }
    setSelectedBucketIds(newSelectedIds);
    onSaveChange(post.id, newSelectedIds.size > 0);

    try {
      if (isCurrentlyInBucket) {
        await db.removePostFromBucket(post.id, bucketId);
      } else {
        await db.addPostToBucket(post.id, bucketId);
      }
    } catch (error) {
      console.error("Failed to update bucket:", error);
      alert("حدث خطأ أثناء تحديث القائمة. الرجاء المحاولة مرة أخرى.");
      // Revert UI on failure
      setSelectedBucketIds(originalSelectedIds);
      onSaveChange(post.id, originalSelectedIds.size > 0);
    }
  };

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBucketName.trim()) {
      try {
        const newBucket = await db.createBucket(user.uid, newBucketName);
        setBuckets([newBucket, ...buckets]);
        setNewBucketName('');
        // Automatically add the post to the newly created bucket
        await handleToggleBucket(newBucket.id);
      } catch (error) {
        console.error("Failed to create bucket", error);
        alert("فشل إنشاء قائمة جديدة.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-6 relative animate-fade-in-up">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-slate-800">حفظ في...</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="إغلاق">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            </div>
        ) : (
            <>
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2 mb-4">
                    {buckets.map(bucket => (
                        <div key={bucket.id} className="flex items-center">
                            <input 
                                type="checkbox"
                                id={`bucket-${bucket.id}`}
                                checked={selectedBucketIds.has(bucket.id)}
                                onChange={() => handleToggleBucket(bucket.id)}
                                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`bucket-${bucket.id}`} className="mr-3 rtl:mr-0 rtl:ml-3 text-slate-700 font-medium">
                                {bucket.name}
                            </label>
                        </div>
                    ))}
                    {buckets.length === 0 && <p className="text-slate-500 text-center py-4">ليس لديك أي قوائم بعد.</p>}
                </div>

                <form onSubmit={handleCreateBucket} className="flex items-center space-x-2 rtl:space-x-reverse border-t pt-4">
                    <input 
                        type="text"
                        value={newBucketName}
                        onChange={(e) => setNewBucketName(e.target.value)}
                        placeholder="إنشاء قائمة جديدة..."
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors" disabled={!newBucketName.trim()}>
                        <PlusIcon className="w-6 h-6" />
                    </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default AddToBucketModal;