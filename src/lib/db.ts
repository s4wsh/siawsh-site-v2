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
    const data = snap.data() as any;

    const toIso = (v: any): string | undefined => {
      if (!v) return undefined;
      try {
        if (typeof v?.toDate === "function") {
          return v.toDate().toISOString();
        }
        if (typeof v?.seconds === "number") {
          return new Date(v.seconds * 1000).toISOString();
        }
        if (typeof v === "string") return v;
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toISOString();
      } catch {}
      return undefined;
    };

    return {
      id: snap.id,
      ...data,
      updatedAt: toIso(data?.updatedAt),
      publishedAt: toIso(data?.publishedAt),
    } as BlogPost;
  },
};
