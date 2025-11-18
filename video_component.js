async function loadProducts() {
  try {
    const res = await fetch("https://api-brunograffer.vercel.app/api/shop");
    const products = await res.json();

    const app = document.getElementById("app");
    app.innerHTML = "";

    products.forEach((p) => {
      const banner = document.createElement("a");
      banner.className = "banner";
      banner.href = p.url; // lien cible
      banner.target = "_blank"; // ouvre dans un nouvel onglet
      banner.rel = "noopener noreferrer";

      const linkStart = p.url
        ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">`
        : "";
      const linkEnd = p.url ? "</a>" : "";

      // --- MODIFICATION COMMENCE ICI ---

      // 1. Vérifier si le produit est en promotion
      // CORRIGÉ : Utilisation de 'compareAtPrice' (vu dans viewer.js) au lieu de 'oldPrice'
      const isPromo =
        p.compareAtPrice && parseFloat(p.compareAtPrice) > parseFloat(p.price);

      // 2. Générer le HTML pour le badge (chaîne vide si pas de promo)
      const badgeHTML = isPromo ? `<div class="badge-promo">PROMO</div>` : "";

      // 3. Mettre à jour le innerHTML pour inclure le conteneur d'image et le badge
      banner.innerHTML = `
              ${linkStart}
                <div class="img-container">
                  ${badgeHTML}
                  <img src="${p.image || ""}" alt="${p.title || ""}" />
                </div>
              ${linkEnd}
              <div class="info">
                ${linkStart}<h3>${p.title || ""}</h3>${linkEnd}
                <p>${p.price || ""} ${p.currency || ""}</p>
                <h4 class="pubCommande">!boutique pour avoir le lien</h4>
              </div>
              
            `;

      // --- MODIFICATION TERMINEE ---

      // store URL on the element to avoid closure/indexing issues during rotation
      if (p.url) banner.dataset.url = p.url;

      // Also keep click for the whole banner (fallback)
      banner.addEventListener("click", (e) => {
        // if user clicked the anchor, let it follow naturally
        if (e.target.closest("a")) return;
        const url = banner.dataset.url;
        if (url) {
          window.open(url, "_blank");
        } else {
          console.warn("Pas d'URL pour ce produit:", p);
        }
      });

      app.appendChild(banner);
    });

    animateBanners();
  } catch (err) {
    console.error("Erreur chargement produits:", err);
  }
}

function animateBanners() {
  const banners = document.querySelectorAll(".banner");
  let index = 0;

  function showNext() {
    // Ensure all banners are hidden and non-interactive
    banners.forEach((b) => {
      b.style.zIndex = "1";
      b.style.pointerEvents = "none";
      // immediately set opacity 0 to avoid visual overlap
      b.style.opacity = "0";
      b.style.visibility = "hidden";
    });

    const current = banners[index];
    // Bring the current banner to front and make it clickable
    current.style.zIndex = "10";
    current.style.visibility = "visible";
    current.style.pointerEvents = "auto";

    // animate in (opacity + scale)
    gsap.fromTo(
      current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );

    // Disparition après 4s
    setTimeout(() => {
      gsap.to(current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => {
          // send current banner back under others and disable clicks
          current.style.zIndex = "1";
          current.style.pointerEvents = "none";
          // ensure it's fully hidden
          current.style.opacity = "0";
          index = (index + 1) % banners.length;
          showNext();
        },
      });
    }, 4000);
  }

  showNext();
}

loadProducts();
