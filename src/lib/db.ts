import type { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { Project, BlogPost } from "@/types/content";

export const projectConverter: FirestoreDataConverter<Project> = {
  toFirestore(p: Project) {
    return p as any;
  },
  fromFirestore(snap: QueryDocumentSnapshot): Project {
    return { id: snap.id, ...(snap.data() as any) } as Project;
  },
};

export const blogConverter: FirestoreDataConverter<BlogPost> = {
  toFirestore(b: BlogPost) {
    return b as any;
  },
  fromFirestore(snap: QueryDocumentSnapshot): BlogPost {
    return { id: snap.id, ...(snap.data() as any) } as BlogPost;
  },
};
