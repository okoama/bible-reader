export interface SessionVisit {
  workId: string;
  sectionId?: string;
  label: string;
  visitedAt: string;
}

export interface SessionNote {
  noteId: string;
  title: string;
  sourceReference: string;
  createdAt: string;
}

export interface SessionPrayer {
  prayerId: string;
  title: string;
  createdAt: string;
}

export interface SessionBookmark {
  bookmarkId: string;
  sourceReference: string;
  label: string;
  createdAt: string;
}

export interface SessionCollectionEvent {
  collectionId: string;
  name: string;
  action: 'create' | 'add_item' | 'update';
  updatedAt: string;
}

export interface StudySession {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  worksVisited: SessionVisit[];
  notesCreated: SessionNote[];
  prayersWritten: SessionPrayer[];
  bookmarksAdded: SessionBookmark[];
  collectionEvents: SessionCollectionEvent[];
}
