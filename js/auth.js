let aktifKullanici = null;
let userData = null;
let tiklamaSayisi = 0; 
let tiklamaZamani = null;

window.gizliKapiKontrol = function() {
    const suAn = new Date().getTime();
    if (tiklamaZamani && (suAn - tiklamaZamani) > 2000) tiklamaSayisi = 0;
    tiklamaZamani = suAn; tiklamaSayisi++;
    if (tiklamaSayisi === 5) {
        tiklamaSayisi = 0; 
        if (prompt("Üstat Protokolü. Doğrulama kodu:") === "13501375213446") {
            window.location.href = "admin.html";
        } else {
            alert("Sistem seni reddetti.");
        }
    }
}

window.authSekme = function(sekme) {
    document.getElementById("form-giris").classList.add("gizli");
    document.getElementById("form-kayit").classList.add("gizli");
    document.querySelectorAll("#login-screen .sekme-btn").forEach(b => b.classList.remove("aktif"));
    
    document.getElementById("form-" + sekme).classList.remove("gizli");
    event.target.classList.add("aktif");
}

window.sistemeKayit = function() {
    const kAdi = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();
    const meslek = document.getElementById("reg-meslek").value;

    if(kAdi === "" || email === "" || pass === "") return alert("Tüm alanları doldurmalısın!");
    if(pass.length < 6) return alert("Şifre en az 6 haneli olmalıdır.");

    if(kAdi === "BÜYÜK ÜSTAT") {
        let ustatSifre = prompt("Üstat, kurucu olduğunu doğrula (Özel Şifre):");
        if(ustatSifre !== "13501375213446") return alert("SİSTEM UYARISI: Sahtekar tespit edildi! Bu ismi alamazsın.");
    }

    const userRef = window.ref(window.db, 'users/' + kAdi);
    
    window.get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert("Bu Kullanıcı Adı zaten alınmış! Başka bir isim seç.");
        } else {
            // Firebase Auth ile kayıt denemesi
            window.createUserWithEmailAndPassword(window.auth, email, pass)
            .then((userCredential) => {
                let baslangicParasi = (kAdi === "BÜYÜK ÜSTAT") ? 9999999 : 500;
                let baslangicEsyasi = (kAdi === "BÜYÜK ÜSTAT") ? 9999 : 5;

                const yeniHesap = {
                    email: email,
                    bakiye: baslangicParasi, 
                    meslek: meslek,
                    envanter: { kripto: baslangicEsyasi, enerji: baslangicEsyasi, kimyasal: baslangicEsyasi }
                };
                
                window.set(userRef, yeniHesap).then(() => {
                    alert("Ağa başarıyla katıldın! Şimdi Giriş Yapabilirsin.");
                    window.authSekme('giris');
                }).catch((dbError) => {
                    alert("Veritabanı Yazma Hatası: " + dbError.message);
                });

            })
            .catch((error) => {
                // HEY! Artık hata gizlenmeyecek, doğrudan ekranda yazacak!
                alert("Firebase Auth Hatası: " + error.message);
            });
        }
    }).catch((err) => {
        alert("Bağlantı Hatası: " + err.message);
    });
}

window.sistemeGiris = function() {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    if(email === "" || pass === "") return alert("E-posta ve şifre girmelisin!");

    window.signInWithEmailAndPassword(window.auth, email, pass)
    .then((userCredential) => {
        const loggedInEmail = userCredential.user.email;
        const usersRef = window.ref(window.db, 'users');
        window.get(usersRef).then((snapshot) => {
            if(snapshot.exists()) {
                let bulundu = false;
                snapshot.forEach((child) => {
                    if(child.val().email === loggedInEmail) {
                        aktifKullanici = child.key;
                        bulundu = true;
                    }
                });
                if(bulundu) {
                    canliVeriDinle();
                    arayuzuAc();
                } else {
                    alert("Yetki Hatası: Bu e-posta ile eşleşen bir ajan profili bulunamadı.");
                }
            }
        });
    })
    .catch((error) => {
        alert("Giriş Hatası: " + error.message);
    });
}

function canliVeriDinle() {
    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    window.onValue(userRef, (snapshot) => {
        if(snapshot.exists()) {
            userData = snapshot.val();
            guncelleUI();
        }
    });
}

function guncelleUI() {
    if(!userData) return;
    const isimEkrani = document.getElementById("oyuncu-adi");
    if(aktifKullanici === "BÜYÜK ÜSTAT") {
        isimEkrani.innerHTML = "[BÜYÜK ÜSTAT] 💠";
        isimEkrani.className = "buyuk-ustat";
    } else {
        isimEkrani.innerText = aktifKullanici;
        isimEkrani.className = "";
    }
    document.getElementById("oyuncu-meslek").innerText = userData.meslek.toUpperCase();
    document.getElementById("oyuncu-bakiye").innerText = userData.bakiye;
    document.getElementById("inv-kripto").innerText = userData.envanter.kripto;
    document.getElementById("inv-enerji").innerText = userData.envanter.enerji;
    document.getElementById("inv-kimyasal").innerText = userData.envanter.kimyasal;

    const bilgi = document.getElementById("uretim-bilgi");
    if(userData.meslek === "madenci") bilgi.innerText = "Gereken: 2 Enerji | Üretilen: 1 Kripto";
    else if(userData.meslek === "teknisyen") bilgi.innerText = "Gereken: 1 Kimyasal | Üretilen: 3 Enerji";
    else if(userData.meslek === "kimyager") bilgi.innerText = "Gereken: 2 Kripto | Üretilen: 1 Kimyasal";
}

function arayuzuAc() {
    document.getElementById("login-screen").classList.add("gizli");
    document.getElementById("game-screen").classList.remove("gizli");
    if(window.pazariBaslat) window.pazariBaslat(); 
}

window.sekmeDegistir = function(sekmeAdi) {
    document.getElementById("sekme-karargah").classList.add("gizli");
    document.getElementById("sekme-pazar").classList.add("gizli");
    document.querySelectorAll(".sekme-btn").files = document.querySelectorAll(".sekme-btn").forEach(btn => btn.classList.remove("aktif"));
    document.getElementById("sekme-" + sekmeAdi).classList.remove("gizli");
    event.target.classList.add("aktif");
}

window.uretimYap = function() {
    let gUrun, gMik, uUrun, uMik;
    if(userData.meslek === "madenci") { gUrun="enerji"; gMik=2; uUrun="kripto"; uMik=1; }
    else if(userData.meslek === "teknisyen") { gUrun="kimyasal"; gMik=1; uUrun="enerji"; uMik=3; }
    else if(userData.meslek === "kimyager") { gUrun="kripto"; gMik=2; uUrun="kimyasal"; uMik=1; }

    if(userData.envanter[gUrun] < gMik) return alert("Yeterli " + gUrun.toUpperCase() + " yok! Karaborsadan al.");

    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    let yeniEnvanter = { ...userData.envanter };
    yeniEnvanter[gUrun] -= gMik;
    yeniEnvanter[uUrun] += uMik;
    window.update(userRef, { envanter: yeniEnvanter });
}
