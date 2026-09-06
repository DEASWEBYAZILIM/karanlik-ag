let marketData = {};

window.pazariBaslat = function() {
    const marketRef = window.ref(window.db, 'market');
    
    // Pazar boşsa başlangıç değerleri ata (İlk kurulum için)
    window.get(marketRef).then((snapshot) => {
        if(!snapshot.exists()) {
            window.set(marketRef, {
                kripto: { fiyat: 50 },
                enerji: { fiyat: 20 },
                kimyasal: { fiyat: 80 }
            });
        }
    });

    // Pazarı canlı dinle
    window.onValue(marketRef, (snapshot) => {
        if(snapshot.exists()) {
            marketData = snapshot.val();
            document.getElementById("fiyat-kripto").innerText = marketData.kripto.fiyat;
            document.getElementById("fiyat-enerji").innerText = marketData.enerji.fiyat;
            document.getElementById("fiyat-kimyasal").innerText = marketData.kimyasal.fiyat;
        }
    });
}

function pazardanAl() {
    const urun = document.getElementById("pazar-urun").value;
    const miktar = parseInt(document.getElementById("pazar-miktar").value);
    if(isNaN(miktar) || miktar <= 0) return;

    const birimFiyat = marketData[urun].fiyat;
    const toplamTutar = birimFiyat * miktar;

    if(userData.bakiye < toplamTutar) return alert("Yetersiz Kredi!");

    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    const pazarRef = window.ref(window.db, 'market/' + urun);

    // Oyuncudan parayı al, eşyayı ver
    window.update(userRef, { 
        bakiye: userData.bakiye - toplamTutar,
        ['envanter/' + urun]: userData.envanter[urun] + miktar
    });

    // Pazar fiyatını dinamik artır (Talep var)
    window.update(pazarRef, { fiyat: birimFiyat + (miktar * 2) });
}

function pazaraSat() {
    const urun = document.getElementById("pazar-urun").value;
    const miktar = parseInt(document.getElementById("pazar-miktar").value);
    if(isNaN(miktar) || miktar <= 0) return;

    if(userData.envanter[urun] < miktar) return alert("Deponda o kadar ürün yok!");

    const birimFiyat = marketData[urun].fiyat;
    const toplamTutar = birimFiyat * miktar;

    const userRef = window.ref(window.db, 'users/' + aktifKullanici);
    const pazarRef = window.ref(window.db, 'market/' + urun);

    // Oyuncuya parayı ver, eşyayı al
    window.update(userRef, { 
        bakiye: userData.bakiye + toplamTutar,
        ['envanter/' + urun]: userData.envanter[urun] - miktar
    });

    // Pazar fiyatını dinamik düşür (Arz arttı)
    let yeniFiyat = birimFiyat - (miktar * 1);
    if (yeniFiyat < 5) yeniFiyat = 5; // Fiyat dibe vurmasın
    
    window.update(pazarRef, { fiyat: yeniFiyat });
}
