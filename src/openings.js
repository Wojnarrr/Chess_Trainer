// src/openings.js
// Expanded opening repertoire with longer move sequences (up to 8 full moves per side)

export const RAW_OPENINGS = {
    "Ruy Lopez - Morphy Defense": [
        "e4", "e5",
        "Nf3", "Nc6",
        "Bb5", "a6",
        "Ba4", "Nf6",
        "O-O", "Be7",
        "Re1", "b5",
        "Bb3", "d6",
        "c3", "O-O",
        "h3", "Nb8"
    ],

    "Queen's Gambit Declined - Tartakower Variation": [
        "d4", "d5",
        "c4", "e6",
        "Nc3", "Nf6",
        "Bg5", "Be7",
        "e3", "O-O",
        "Nf3", "h6",
        "Bh4", "b6",
        "cxd5", "Nxd5",
        "Bxe7", "Qxe7"
    ],

    "Italian Game - Giuoco Piano": [
        "e4", "e5",
        "Nf3", "Nc6",
        "Bc4", "Bc5",
        "c3", "Nf6",
        "d3", "d6",
        "O-O", "O-O",
        "Re1", "a6",
        "a4", "Ba7",
        "Nbd2", "Be6"
    ],

    "Sicilian Defense - Najdorf Variation": [
        "e4", "c5",
        "Nf3", "d6",
        "d4", "cxd4",
        "Nxd4", "Nf6",
        "Nc3", "a6",
        "Be3", "e5",
        "Nb3", "Be6",
        "f3", "Nbd7",
        "Qd2", "b5"
    ],

    "French Defense - Advance Variation": [
        "e4", "e6",
        "d4", "d5",
        "e5", "c5",
        "c3", "Nc6",
        "Nf3", "Qb6",
        "a3", "c4",
        "g3", "Na5",
        "Nbd2", "Bd7"
    ],

    "Caro-Kann - Classical Variation": [
        "e4", "c6",
        "d4", "d5",
        "Nc3", "dxe4",
        "Nxe4", "Bf5",
        "Ng3", "Bg6",
        "Nf3", "Nd7",
        "h4", "h6",
        "h5", "Bh7"
    ],

    "King's Indian Defense - Main Line": [
        "d4", "Nf6",
        "c4", "g6",
        "Nc3", "Bg7",
        "e4", "d6",
        "Nf3", "O-O",
        "Be2", "e5",
        "O-O", "Nc6",
        "d5", "Ne7"
    ],

    "English Opening - Symmetrical Variation": [
        "c4", "c5",
        "Nc3", "Nc6",
        "g3", "g6",
        "Bg2", "Bg7",
        "Nf3", "Nf6",
        "O-O", "O-O",
        "d3", "d6"
    ],

    "Scandinavian Defense - Main Line": [
        "e4", "d5",
        "exd5", "Qxd5",
        "Nc3", "Qa5",
        "d4", "Nf6",
        "Nf3", "Bg4",
        "h3", "Bxf3",
        "Qxf3", "c6"
    ],

    "Pirc Defense - Austrian Attack": [
        "e4", "d6",
        "d4", "Nf6",
        "Nc3", "g6",
        "f4", "Bg7",
        "Nf3", "c6",
        "Be3", "b5",
        "e5", "Ng4"
    ]
};

// For the trainer, we also export OPENINGS alias
export const OPENINGS = RAW_OPENINGS;
