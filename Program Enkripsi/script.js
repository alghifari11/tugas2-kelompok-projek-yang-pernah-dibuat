let publicKey, privateKey, n;

function gcd(a, b) {
    let steps = [];
    while (b !== 0) {
        steps.push(`GCD: ${a} mod ${b} = ${a % b}`);
        let temp = b;
        b = a % b;
        a = temp;
    }
    document.getElementById('steps').innerText += `\nLangkah GCD:\n${steps.join('\n')}`;
    return a;
}

function modInverse(e, phi) {
    let steps = [];
    let m0 = phi, t, q;
    let x0 = 0, x1 = 1;

    if (phi === 1) return 0;

    while (e > 1) {
        q = Math.floor(e / phi);
        steps.push(`${e} = ${q} * ${phi} + ${e % phi}`);
        t = phi;
        phi = e % phi;
        e = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
    }

    steps.push(`Hasil akhir invers modulo: ${(x1 + m0) % m0}`);
    document.getElementById('steps').innerText += `\nLangkah Invers Modulo:\n${steps.join('\n')}`;
    return (x1 + m0) % m0;
}

function isPrime(num) {
    let steps = [];
    if (num <= 1) {
        steps.push(`${num} bukan bilangan prima karena kurang dari atau sama dengan 1.`);
        document.getElementById('steps').innerText += `\nLangkah Cek Prima:\n${steps.join('\n')}`;
        return false;
    }
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) {
            steps.push(`${num} habis dibagi ${i}, jadi bukan prima.`);
            document.getElementById('steps').innerText += `\nLangkah Cek Prima:\n${steps.join('\n')}`;
            return false;
        }
    }
    steps.push(`${num} adalah bilangan prima.`);
    document.getElementById('steps').innerText += `\nLangkah Cek Prima:\n${steps.join('\n')}`;
    return true;
}

function modExp(base, exp, mod) {
    let steps = [];
    let result = 1;
    base = base % mod;
    steps.push(`Basis awal: ${base}`);

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
            steps.push(`Hasil diperbarui menjadi ${result} (eksponen ganjil)`);
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
        steps.push(`Basis dikuadratkan menjadi ${base}, eksponen dibagi dua menjadi ${exp}`);
    }

    steps.push(`Hasil akhir: ${result}`);
    document.getElementById('steps').innerText += `\nLangkah Eksponensial Modulo:\n${steps.join('\n')}`;
    return result;
}

function generateKeys() {
    document.getElementById('steps').innerText = '';
    let p = parseInt(document.getElementById('p').value);
    let q = parseInt(document.getElementById('q').value);

    if (!isPrime(p) || !isPrime(q)) {
        alert('Kedua angka harus prima.');
        return;
    }

    n = p * q; // Calculate n
    let phi = (p - 1) * (q - 1); // Calculate Euler's totient

    // Find e such that 1 < e < phi and gcd(e, phi) = 1
    let e;
    for (e = 2; e < phi; e++) {
        if (gcd(e, phi) === 1) break; // Find an e that is coprime with phi
    }

    // Find d such that d * e ≡ 1 (mod phi)
    let d = modInverse(e, phi); // Calculate the modular inverse of e modulo phi

    publicKey = { e, n }; // Set public key
    privateKey = { d, n }; // Set private key

    // Explanation displayed in the calculation steps
    document.getElementById('steps').innerText = `
Langkah Pembuatan Kunci:
1. n = p * q = ${p} * ${q} = ${n}
2. phi(n) = (p - 1) * (q - 1) = (${p} - 1) * (${q} - 1) = ${phi}
3. e dipilih sehingga 1 < e < phi(n) dan gcd(e, phi(n)) = 1. 
   Pilih e = ${e} karena gcd(${e}, ${phi}) = 1
4. d adalah invers modular dari e, yang berarti (d * e) % phi(n) = 1.
   d = ${d} sehingga (${d} * ${e}) % ${phi} = 1
`;

    // Display the public and private keys below the key generation section
    document.getElementById('keys').innerText = `
Kunci Publik: (e = ${e}, n = ${n})
Kunci Privat: (d = ${d}, n = ${n})
`;
}




function encrypt() {
    document.getElementById('steps').innerText = '';
    if (!publicKey) {
        alert('Buat kunci terlebih dahulu!');
        return;
    }

    let plaintext = document.getElementById('plaintext').value;
    if (!plaintext) {
        alert('Masukkan pesan untuk dienkripsi.');
        return;
    }

    let steps = [];
    let encrypted = Array.from(plaintext).map(char => {
        let m = char.charCodeAt(0); // ASCII value of character
        let c = modExp(m, publicKey.e, publicKey.n); // Encryption formula C = M^e mod n
        steps.push(`Karakter: ${char} (ASCII ${m}) -> Terenkripsi: ${c}`);
        return c;
    });

    document.getElementById('ciphertext').innerText = `Ciphertext: ${encrypted.join(' ')}`;
    document.getElementById('steps').innerText = `Langkah Enkripsi:\n${steps.join('\n')}`;
    document.getElementById('copyButton').style.display = 'block';
}

function copyCiphertext() {
    const ciphertextDiv = document.getElementById('ciphertext');
    const copyButton = document.getElementById('copyButton');

    // Buat elemen sementara untuk menyalin teks
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = ciphertextDiv.innerText.replace("Ciphertext: ", "").trim();
    document.body.appendChild(tempTextArea);

    // Pilih dan salin teks
    tempTextArea.select();
    document.execCommand('copy');

    // Hapus elemen sementara
    document.body.removeChild(tempTextArea);

    // Tampilkan status pada tombol salin
    copyButton.innerText = 'Copied!';
    setTimeout(() => {
        copyButton.innerText = 'Copy Ciphertext';
    }, 1500);
}


function decrypt() {
    document.getElementById('steps').innerText = '';
    if (!privateKey) {
        alert('Buat kunci terlebih dahulu!');
        return;
    }

    let cipherText = document.getElementById('cipher').value;
    if (!cipherText) {
        alert('Masukkan ciphertext untuk didekripsi.');
        return;
    }

    let steps = [];
    let cipherArray = cipherText.split(' ').map(Number); // Split and convert to numbers
    let decrypted = cipherArray.map(c => {
        let m = modExp(c, privateKey.d, privateKey.n); // Decryption formula M = C^d mod n
        steps.push(`Terenkripsi: ${c} -> ASCII: ${m} -> Karakter: ${String.fromCharCode(m)}`);
        return String.fromCharCode(m); // Convert ASCII back to character
    }).join('');

    document.getElementById('decrypted').innerText = `Pesan Terdekripsi: ${decrypted}`;
    document.getElementById('steps').innerText = `Langkah Dekripsi:\n${steps.join('\n')}`;
}

