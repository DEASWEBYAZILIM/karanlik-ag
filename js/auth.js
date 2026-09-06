let aktifKullanici = null;
let userData = null;
let tiklamaSayisi = 0; let tiklamaZamani = null;

function gizliKapiKontrol() {
    const suAn = new Date().getTime();
    if (tiklamaZamani && (suAn - tiklamaZamani) > 2000) tiklamaSayisi = 0;
    tiklamaZamani = suAn; tiklamaSayisi++;

    if (tiklamaSayisi === 5) {
        tiklamaSayisi = 0; 
        let sifre = prompt("Üstat Protokolü. Doğrulama kodu girin:");
        if (sifre === "13501375213446") {
            window.location.href = "admin.html";
        } else {
            alert("Sistem seni reddetti.");
        }
    }
}

function sistemeGiris() {
    const kAdi = document.getElementById("username").value.trim();
    if(kAdi === "") return alert("Kullanıcı adı boş olamaz!");
    
    const userRef = window.ref(window.db, 'users/' + kAdi);
    window.get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Kullanıcı var, oyuna sok
            aktifKullanici = kAdi;
            canliVeriDinle();
            arayuzuAc();
        } else {
            // Yeni kullanıcı, meslek seçti mi kontrol et
            const meslekSecimDiv = document.getElementById("meslek-secimi");
            if(meslekSecimDiv.classList.contains("gizli")) {
                meslekSecimDiv.classList.remove("gizli");
                alert("Sistemde kaydın yok. Lütfen bir meslek seç ve tekrar butona bas.");
            } else {
                const secilenMeslek = document.getElementById("meslek").value;
                const yeniHesap = {
                    bakiye: 500, meslek: secilenMeslek,
                    envanter: { kripto: 5, enerji: 5, kimyasal: 5 }
                };
                window.set(userRef, yeniHesap).then(() => {
                    aktifKullanici = kAdi;
                    canliVeriDinle();
                    arayuzuAc();
                });
            }
        }
    });
}

function canliVeriDinle() {
    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    window.onValue(userRef, (snapshot) => {
        userData = snapshot.val();
        guncelleUI();
    });
}

function guncelleUI() {
    const isimEkrani = document.getElementById("oyuncu-adi");
    if(aktifKullanici === "BÜYÜK ÜSTAT") {
        isimEkrani.innerHTML = "[BÜYÜK ÜSTAT] 💠";
        isimEkrani.className = "buyuk-ustat";
    } else {
        isimEkrani.innerText = aktifKullanici;
    }

    document.getElementById("oyuncu-meslek").innerText = userData.meslek.toUpperCase();
    document.getElementById("oyuncu-bakiye").innerText = userData.bakiye;
    document.getElementById("inv-kripto").innerText = userData.envanter.kripto;
    document.getElementById("inv-enerji").innerText = userData.envanter.enerji;
    document.getElementById("inv-kimyasal").innerText = userData.envanter.kimyasal;

    // Mesleğe göre üretim bilgisi
    const bilgi = document.getElementById("uretim-bilgi");
    if(userData.meslek === "madenci") bilgi.innerText = "Gereken: 2 Enerji | Üretilen: 1 Kripto";
    else if(userData.meslek === "teknisyen") bilgi.innerText = "Gereken: 1 Kimyasal | Üretilen: 3 Enerji";
    else if(userData.meslek === "kimyager") bilgi.innerText = "Gereken: 2 Kripto | Üretilen: 1 Kimyasal";
}

function arayuzuAc() {
    document.getElementById("login-screen").classList.add("gizli");
    document.getElementById("game-screen").classList.remove("gizli");
    window.pazariBaslat(); // market.js içindeki fonksiyonu tetikle
}

function sekmeDegistir(sekmeAdi) {
    document.getElementById("sekme-karargah").classList.add("gizli");
    document.getElementById("sekme-pazar").classList.add("gizli");
    document.querySelectorAll(".sekme-btn").forEach(btn => btn.classList.remove("aktif"));
    
    document.getElementById("sekme-" + sekmeAdi).classList.remove("gizli");
    event.target.classList.add("aktif");
}

function uretimYap() {
    let gerekenUrun, gerekenMiktar, uretilenUrun, uretilenMiktar;
    
    if(userData.meslek === "madenci") { gerekenUrun = "enerji"; gerekenMiktar = 2; uretilenUrun = "kripto"; uretilenMiktar = 1; }
    else if(userData.meslek === "teknisyen") { gerekenUrun = "kimyasal"; gerekenMiktar = 1; uretilenUrun = "enerji"; uretilenMiktar = 3; }
    else if(userData.meslek === "kimyager") { gerekenUrun = "kripto"; gerekenMiktar = 2; uretilenUrun = "kimyasal"; uretilenMiktar = 1; }

    if(userData.envanter[gerekenUrun] < gerekenMiktar) {
        return alert("Üretim için yeterli " + gerekenUrun.toUpperCase() + " yok! Karaborsadan satın almalısın.");
    }

    // Üretimi Veritabanına Yaz
    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    let yeniEnvanter = { ...userData.envanter };
    yeniEnvanter[gerekenUrun] -= gerekenMiktar;
    yeniEnvanter[uretilenUrun] += uretilenMiktar;

    window.update(userRef, { envanter: yeniEnvanter }).then(() => {
        // UI otomatik onValue ile güncellenecek
    });
}
