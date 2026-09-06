function paraMudehalesi() {
    const hedef = document.getElementById("hedef-oyuncu").value.trim();
    const miktar = parseInt(document.getElementById("gonderilecek-miktar").value);
    if(hedef === "" || isNaN(miktar)) return alert("Geçersiz bilgi!");

    const userRef = window.ref(window.db, 'users/' + hedef);
    window.get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            window.update(userRef, { bakiye: snapshot.val().bakiye + miktar });
            alert("İşlem Başarılı! Krediler aktarıldı.");
        } else alert("Oyuncu bulunamadı!");
    });
}

function oyuncuyuSifirla() {
    const hedef = document.getElementById("hedef-oyuncu").value.trim();
    if(hedef === "") return;
    const userRef = window.ref(window.db, 'users/' + hedef);
    window.update(userRef, { 
        bakiye: 0, 
        envanter: { kripto: 0, enerji: 0, kimyasal: 0 } 
    });
    alert(hedef + " adlı oyuncunun tüm mal varlığına el konuldu!");
}

function piyasayiCokert() {
    const pazarRef = window.ref(window.db, 'market');
    window.set(pazarRef, {
        kripto: { fiyat: 10 },
        enerji: { fiyat: 5 },
        kimyasal: { fiyat: 15 }
    });
    alert("KÜRESEL KRİZ YARATILDI! Tüm pazar fiyatları dibe vurduruldu.");
}
