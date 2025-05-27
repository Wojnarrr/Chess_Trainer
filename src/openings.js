// src/openings.js
// Grouped opening repertoire with expanded lines and categorizations

export const OPENING_CATEGORIES = {
    "King's Pawn Openings (e4)": {
        "Ruy Lopez": {
            "Morphy Defense": [
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
            "Berlin Defense": [
                "e4", "e5",
                "Nf3", "Nc6",
                "Bb5", "Nf6",
                "O-O", "Nxe4",
                "d4", "Nd6",
                "Bc6", "dxc6",
                "dxe5", "Nf5"
            ]
        },
        "Italian Game": {
            "Giuoco Piano": [
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
            "Evans Gambit": [
                "e4", "e5",
                "Nf3", "Nc6",
                "Bc4", "Bc5",
                "b4", "Bxb4",
                "c3", "Ba5",
                "d4", "exd4",
                "O-O", "Nge7"
            ]
        },
        "Scotch Game": [
            "e4", "e5",
            "Nf3", "Nc6",
            "d4", "exd4",
            "Nxd4", "Nf6",
            "Nc3", "Bb4"
        ],
        "Scandinavian Defense": [
            "e4", "d5",
            "exd5", "Qxd5",
            "Nc3", "Qa5",
            "d4", "Nf6",
            "Nf3", "Bg4",
            "h3", "Bxf3",
            "Qxf3", "c6"
        ],
        "Caro-Kann Defense": {
            "Classical Variation": [
                "e4", "c6",
                "d4", "d5",
                "Nc3", "dxe4",
                "Nxe4", "Bf5",
                "Ng3", "Bg6",
                "Nf3", "Nd7",
                "h4", "h6",
                "h5", "Bh7"
            ],
            "Panov-Botvinnik Attack": [
                "e4", "c6",
                "d4", "d5",
                "exd5", "cxd5",
                "c4", "Nf6",
                "Nc3", "Nc6"
            ]
        },
        "French Defense": {
            "Advance Variation": [
                "e4", "e6",
                "d4", "d5",
                "e5", "c5",
                "c3", "Nc6",
                "Nf3", "Qb6",
                "a3", "c4",
                "g3", "Na5",
                "Nbd2", "Bd7"
            ],
            "Tarrasch Variation": [
                "e4", "e6",
                "d4", "d5",
                "Nd2", "c5",
                "exd5", "exd5",
                "Ngf3", "Nc6",
                "Bb5", "Be7"
            ]
        },
        "Pirc Defense": {
            "Austrian Attack": [
                "e4", "d6",
                "d4", "Nf6",
                "Nc3", "g6",
                "f4", "Bg7",
                "Nf3", "c6",
                "Be3", "b5",
                "e5", "Ng4"
            ]
        }
    },
    "Queen's Pawn Openings (d4)": {
        "Queen's Gambit": {
            "Declined - Tartakower Variation": [
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
            "Accepted": [
                "d4", "d5",
                "c4", "dxc4",
                "Nf3", "Nf6",
                "e3", "e6",
                "Bxc4", "c5",
                "O-O", "a6"
            ]
        },
        "Slav Defense": [
            "d4", "d5",
            "c4", "c6",
            "Nf3", "Nf6",
            "Nc3", "dxc4",
            "a4", "Bf5",
            "Ne5", "Nbd7"
        ],
        "King's Indian Defense": [
            "d4", "Nf6",
            "c4", "g6",
            "Nc3", "Bg7",
            "e4", "d6",
            "Nf3", "O-O",
            "Be2", "e5",
            "O-O", "Nc6",
            "d5", "Ne7"
        ],
        "Nimzo-Indian Defense": [
            "d4", "Nf6",
            "c4", "e6",
            "Nc3", "Bb4",
            "e3", "O-O",
            "Bd3", "d5"
        ]
    },
    "Flank Openings (c4, f4)": {
        "English Opening": [
            "c4", "c5",
            "Nc3", "Nc6",
            "g3", "g6",
            "Bg2", "Bg7",
            "Nf3", "Nf6",
            "O-O", "O-O",
            "d3", "d6"
        ],
        "Reti Opening": [
            "Nf3", "d5",
            "c4", "c6",
            "g3", "g6",
            "Bg2", "Bg7"
        ],
        "Bird's Opening": [
            "f4", "d5",
            "Nf3", "Nf6",
            "e3", "c5",
            "b3", "Nc6"
        ]
    }
};

// Flattened mapping for Trainer and Puzzle modes
export function getAllOpenings() {
    const flat = {};
    Object.values(OPENING_CATEGORIES).forEach(category => {
        Object.entries(category).forEach(([name, data]) => {
            if (Array.isArray(data)) {
                flat[name] = data;
            } else {
                Object.entries(data).forEach(([varName, moves]) => {
                    flat[`${name} - ${varName}`] = moves;
                });
            }
        });
    });
    return flat;
}

export const OPENINGS = getAllOpenings();
