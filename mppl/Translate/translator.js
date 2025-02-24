async function translateText() {
    const text = document.getElementById("textToTranslate").value;
    const langPair = "en|es"; // contoh untuk menerjemahkan dari bahasa Inggris ke Spanyol

    const response = await fetch(https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair});
    const data = await response.json();

    if (data.responseData) {
        document.getElementById("translatedText").innerText = data.responseData.translatedText;
    } else {
        document.getElementById("translatedText").innerText = "Translation error!";
    }
}