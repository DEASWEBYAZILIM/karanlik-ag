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
    if(event && event.target) event.target.classList.add("aktif");
}

// KAYIT OLMA FONKSİYONU (Garanti Tetikleme)
window.sistemeKayit = function() {
    const kAdi = document.getElementById("reg-username").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();
    const meslek = document.getElementById("reg-meslek").value;

    if(kAdi === "" || pass === "") {
        return alert("Kullanıcı adı ve şifre boş olamaz!");
    }

    if(kAdi === "BÜYÜK ÜSTAT") {
        let ustatSifre = prompt("Üstat, kurucu olduğunu doğrula (Özel Şifre):");
        if(ustatSifre !== "13501375213446") {
            return alert("SİSTEM UYARISI: Sahtekar tespit edildi!");
        }
    }

    if(!window.db || !window.ref) {
        return alert("Firebase bağlantısı yükleniyor, lütfen 2 saniye bekleyip tekrar dene.");
    }

    const userRef = window.ref(window.db, 'users/' + kAdi);
    
    window.get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            alert("Bu Kullanıcı Adı zaten alınmış! Başka bir isim seç.");
        } else {
            let baslangicParasi = (kAdi === "BÜYÜK ÜSTAT") ? 9999999 : 500;
            let baslangicEsyasi = (kAdi === "BÜYÜK ÜSTAT") ? 9999 : 5;

            const yeniHesap = {
                sifre: pass,
                bakiye: baslangicParasi, 
                meslek: meslek,
                envanter: { kripto: baslangicEsyasi, enerji: baslangicEsyasi, kimyasal: baslangicEsyasi }
            };
            
            window.set(userRef, yeniHesap).then(() => {
                alert("Ağa başarıyla katıldın! Şimdi Giriş Yapabilirsin.");
                window.authSekme('giris');
            }).catch((err) => {
                alert("Yazma Hatası: " + err.message);
            });
        }
    }).catch((err) => {
        alert("Bağlantı Hatası: " + err.message);
    });
}

// GİRİŞ YAPMA FONKSİYONU
window.sistemeGiris = function() {
    const kAdi = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-pass").value.trim();
    
    if(kAdi === "" || pass === "") {
        return alert("Kullanıcı adı ve şifre girmelisin!");
    }

    if(!window.db || !window.ref) {
        return alert("Firebase bağlantısı yükleniyor!");
    }

    const userRef = window.ref(window.db, 'users/' + kAdi);
    window.get(userRef).then((snapshot) => {
        if(snapshot.exists()) {
            const veri = snapshot.val();
            if(veri.sifre === pass) {
                aktifKullanici = kAdi;
                canliVeriDinle();
                arayuzuAc();
            } else {
                alert("Hatalı şifre!");
            }
        } else {
            alert("Böyle bir ajan bulunamadı! Önce Kayıt Olmalısın.");
        }
    }).catch((err) => {
        alert("Giriş Hatası: " + err.message);
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
    document.querySelectorAll(".sekme-btn").forEach(btn => btn.classList.remove("aktif"));
    document.getElementById("sekme-" + sekmeAdi).classList.remove("gizli");
    if(event && event.target) event.target.classList.add("aktif");
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
