import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export async function uploadReportToFirebaseStorage(
  file: File, 
  patientId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!isFirebaseConfigured) {
    if (onProgress) {
      onProgress(50);
      await new Promise(r => setTimeout(r, 200));
      onProgress(100);
    }
    return URL.createObjectURL(file);
  }

  const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `medical_reports/${patientId}/${cleanFileName}`);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.warn('Storage upload error, falling back to local object URL:', error);
        resolve(URL.createObjectURL(file));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch {
          resolve(URL.createObjectURL(file));
        }
      }
    );
  });
}