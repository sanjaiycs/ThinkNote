import * as pdfjsLib from 'pdfjs-dist';

// Use specific version to match package.json (5.4.624) or fall back to a known working version like 4.10.38 if 5.x is problematic in browser
// pdfjs-dist 5.x is ESM only and might have issues with some CDNs or bundlers if not configured perfectly.
// Let's try to use the version from the package, but standard CDNs might not have 5.4.624 yet or the path structure changed.
// Actually, let's use a robust CDN link for 4.10.38 which is stable, OR try to resolve the local one.
// The most reliable way without copying files is often unpkg or cdnjs.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPDF = async (file) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log("PDF Loaded, pages:", pdf.numPages);
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item) => item.str).join(' ');
            console.log(`Page ${i} text length:`, pageText.length);
            text += `\n\n--- Page ${i} ---\n\n${pageText}`;
        }

        console.log("Total extracted text length:", text.length);
        return text;
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        throw error;
    }
};
