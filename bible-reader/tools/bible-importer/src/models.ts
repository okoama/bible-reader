export interface Verse {
    number: number;
    text: string;
}

export interface Chapter {
    number: number;
    verses: Verse[];
}

export interface BibleBook {
    id: string;
    name: string;
    abbreviation: string;
    testament: "old" | "deuterocanon" | "new";
    chapters: Chapter[];
}