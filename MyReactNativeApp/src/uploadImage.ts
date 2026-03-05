import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// React Native needs a blob to upload
async function uriToBlob(uri: string): Promise<Blob> {
    const res = await fetch(uri);
    return await res.blob();
}

export async function uploadPostImage(params: {
    uid: string;
    postId: string;
    imageUri: string;
}) {
    const { uid, postId, imageUri } = params;

    const blob = await uriToBlob(imageUri);
    const storageRef = ref(storage, `posts/${uid}/${postId}.jpg`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
}

export async function uploadAvatarImage(params: {
    uid: string;
    imageUri: string;
}) {
    const { uid, imageUri } = params;

    const blob = await uriToBlob(imageUri);
    const storageRef = ref(storage, `avatars/${uid}/avatar.jpg`);

    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
}
