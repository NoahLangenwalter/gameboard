
export class Text {
    static #hashTable = new Map();
    static lineHeightMultiplier = 1.25;

    static formatContent(context, text, fontName, maxWidth, maxHeight) {
        const textHash = Text.hash(text + fontName + maxWidth + maxHeight);
        let sizedText = Text.#hashTable.get(textHash);
        if (sizedText) {
            return sizedText;
        }

        let fontSize = 200;
        let font = `${fontSize}px ${fontName}`;
        context.font = font;
        let lineHeight = context.measureText("M").width * Text.lineHeightMultiplier;

        let lines = Text.generateLines(context, text, maxWidth);

        while (lines === null || lines.length * lineHeight > maxHeight) {
            fontSize -= Math.ceil(fontSize / 50);
            font = `${fontSize}px ${fontName}`;
            context.font = font;

            lineHeight = context.measureText("M").width * Text.lineHeightMultiplier;

            lines = Text.generateLines(context, text, maxWidth);
        }

        lineHeight = maxHeight / lines.length;

        sizedText = new SizedText(fontSize, lineHeight, lines);
        Text.#hashTable.set(textHash, sizedText);

        return sizedText;
    }

    static generateLines(context, text, maxWidth) {
        let wordsInLine = 0;
        const lines = [];
        const charLimit = 10;

        let rawLines = text.split("\n");
        for (let i = 0; i < rawLines.length; i++) {
            let line = "";
            let words = rawLines[i].split(" ");
            for (let j = 0; j < words.length; j++) {
                let word = words[j];

                //break word into two
                if (!Text.textFits(context, word, maxWidth) && word.length > charLimit) {
                    const newWord = word.slice(charLimit);
                    words.splice(j + 1, 0, newWord);
                    word = words[j] = word.slice(0, charLimit);
                }

                //still too big? Reduce font
                if (!Text.textFits(context, word, maxWidth)) {
                    return null;
                }

                let testLine = line;
                if (wordsInLine > 0) { testLine += " "; }
                testLine += word;

                if (Text.textFits(context, testLine, maxWidth)) {
                    line = testLine;
                    wordsInLine++;
                }
                else {
                    //line would be too wide with added word

                    //if the trial line wasn't that long, trigger a fontSize reduction
                    if (testLine.length < 6) {
                        return null;
                    }

                    lines.push(line);
                    line = word;
                    wordsInLine = 1;
                }
            }

            if (wordsInLine === 1) {
                let lastWord = line;
                while (lastWord !== null) {
                    lastWord = null;
                    //break last word into two
                    if (!Text.textFits(context, line, maxWidth) && line.length > charLimit) {
                        lastWord = line.slice(charLimit);
                        line = word.slice(0, charLimit);
                        lines.push(line);
                        line = lastWord;
                    }

                    //still too big? Reduce font
                    if (!Text.textFits(context, line, maxWidth)) {
                        return null;
                    }
                }
            }

            lines.push(line);
            wordsInLine = 0;
        }

        return lines;
    }

    static textFits(context, text, maxWidth, widthMultiplier = 1) {
        let textWidth = context.measureText(text).width * widthMultiplier;
        return textWidth < maxWidth;
    }

    // Pilfered from https://stackoverflow.com/a/52171480/19789360
    static hash = (str, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed,
            h2 = 0x41c6ce57 ^ seed;
        for (let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }

        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };
}

class SizedText {
    fontSize = 0;
    lineHeight = 0;
    lines = [];
    constructor(fontSize, lineHeight, lines) {
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.lines = lines;
    }
}