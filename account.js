
(function () {
  "use strict";

  var sb = window.sb;
  if (!sb) {
    console.error("PIXELON: Chýba Supabase klient (window.sb).");
    return;
  }

  var L = {
    sk: {
      account: "Môj účet",
      order: "Nová objednávka",
      type: "Vyber typ editu",
      pack: "Vyber balík",
      title: "Názov projektu",
      details: "Opíš zadanie, štýl, dĺžku videa a termín...",
      link: "Odkaz na video alebo materiály (nepovinné)",
      send: "Odoslať objednávku",
      mine: "Moje objednávky",
      all: "Administrácia – všetky objednávky",
      empty: "Zatiaľ žiadne objednávky.",
      loading: "Načítavam...",
      success: "Objednávka bola odoslaná.",
      error: "Operácia sa nepodarila. Skús to znova.",
      save: "Uložiť",
      close: "Zavrieť",
      progress: "Postup %",
      note: "Cenu potvrdíme po prijatí objednávky. Platby zatiaľ nie sú zapnuté.",
      types: {
        minecraft: "Minecraft / gaming edit",
        youtube: "YouTube video",
        shorts: "YouTube Shorts",
        tiktok: "TikTok edit",
        amv: "AMV / anime edit",
        cinematic: "Cinematic edit",
        intro: "Intro / outro",
        promo: "Reklamný edit",
        music: "Lyric / music video",
        other: "Iný typ editu"
      },
      packs: {
        basic: "Basic",
        pro: "Pro",
        premium: "Premium",
        custom: "Individuálna ponuka"
      },
      statuses: {
        new: "Nová objednávka",
        waiting_payment: "Čaká na platbu",
        waiting_materials: "Čaká na materiály",
        assigned: "Priradená editorovi",
        in_progress: "Prebieha editovanie",
        review: "Kontrola",
        revisions: "Požadované úpravy",
        done: "Dokončená",
        cancelled: "Zrušená"
      }
    },
    en: {
      account: "My account",
      order: "New order",
      type: "Choose edit type",
      pack: "Choose package",
      title: "Project name",
      details: "Describe the project, style, video length and deadline...",
      link: "Video or materials link (optional)",
      send: "Submit order",
      mine: "My orders",
      all: "Admin – all orders",
      empty: "No orders yet.",
      loading: "Loading...",
      success: "Order submitted successfully.",
      error: "The operation failed. Please try again.",
      save: "Save",
      close: "Close",
      progress: "Progress %",
      note: "The price will be confirmed after receiving the order. Payments are not enabled yet.",
      types: {
        minecraft: "Minecraft / gaming edit",
        youtube: "YouTube video",
        shorts: "YouTube Shorts",
        tiktok: "TikTok edit",
        amv: "AMV / anime edit",
        cinematic: "Cinematic edit",
        intro: "Intro / outro",
        promo: "Promotional edit",
        music: "Lyric / music video",
        other: "Other edit"
      },
      packs: {
        basic: "Basic",
        pro: "Pro",
        premium: "Premium",
        custom: "Custom offer"
      },
      statuses: {
        new: "New order",
        waiting_payment: "Waiting for payment",
        waiting_materials: "Waiting for materials",
        assigned: "Assigned to editor",
        in_progress: "Editing",
        review: "Review",
        revisions: "Revisions requested",
        done: "Completed",
        cancelled: "Cancelled"
      }
    }
  };

  function tr() {
    return L[window.lang] || L.sk;
  }

  var typeKeys = [
    "minecraft", "youtube", "shorts", "tiktok", "amv",
    "cinematic", "intro", "promo", "music", "other"
  ];

  var packKeys = ["basic", "pro", "premium", "custom"];

  var statusKeys = [
    "new", "waiting_payment", "waiting_materials",
    "assigned", "in_progress", "review",
    "revisions", "done", "cancelled"
  ];

  function el(parent, tag, text, cls) {
    var node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (cls) node.className = cls;
    parent.appendChild(node);
    return node;
  }

  function styleField(node) {
    node.style.cssText =
      "display:block;width:100%;box-sizing:border-box;" +
      "padding:12px;margin:8px 0;border-radius:9px;" +
      "border:1px solid var(--line,#20375c);" +
      "background:#060d1c;color:var(--text,#e6efff);" +
      "font:inherit;";
  }

  function fillSelect(select, keys, labels, selected) {
    keys.forEach(function (key) {
      var option = el(select, "option", labels[key]);
      option.value = key;
      option.selected = key === selected;
    });
  }

  // Modrá ikonka profilu v navigácii
  var profileButton = document.createElement("button");
  profileButton.type = "button";
  profileButton.className = "btn";
  profileButton.textContent = "👤";
  profileButton.title = "Môj účet";
  profileButton.setAttribute("aria-label", "Môj účet");
  profileButton.style.cssText =
    "padding:6px 10px;min-height:36px;font-size:14px;" +
    "border:1px solid #299df4;color:#299df4;" +
    "background:rgba(41,157,244,.08);display:none;";

  var nav = document.querySelector("nav");

  if (nav) {
    var navButton = nav.querySelector(".btn");
    if (navButton) nav.insertBefore(profileButton, navButton);
    else nav.appendChild(profileButton);
  }

  // Pozadie a samostatné modálne okno
  var overlay = document.createElement("div");
  overlay.hidden = true;
  overlay.setAttribute("role", "presentation");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:99999;" +
    "display:none;align-items:center;justify-content:center;" +
    "padding:16px;box-sizing:border-box;" +
    "background:rgba(0,0,0,.78);backdrop-filter:blur(8px);";

  var panel = document.createElement("section");
  panel.className = "own-p";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "PIXELON – Môj účet");
  panel.style.cssText =
    "position:relative;width:100%;max-width:720px;" +
    "max-height:85vh;overflow-y:auto;box-sizing:border-box;" +
    "padding:22px;border:1px solid #299df4;" +
    "border-radius:18px;background:#071122;" +
    "color:var(--text,#e6efff);" +
    "box-shadow:0 0 35px rgba(41,157,244,.2);";

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  var userId = null;
  var isAdmin = false;
  var orderList = null;
  var opening = false;
  var previousFocus = null;

  function openWindow() {
    previousFocus = document.activeElement;
    overlay.hidden = false;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closeWindow() {
    overlay.hidden = true;
    overlay.style.display = "none";
    document.body.style.overflow = "";

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeWindow();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !overlay.hidden) {
      closeWindow();
    }
  });

  function showError(target, error) {
    console.error("PIXELON:", error);
    target.textContent = tr().error;
  }

  async function loadOrders() {
    if (!orderList || !userId) return;

    var t = tr();
    orderList.textContent = t.loading;

    try {
      var query = sb
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }

      var result = await query;
      orderList.textContent = "";

      if (result.error) {
        showError(orderList, result.error);
        return;
      }

      var orders = result.data || [];

      if (!orders.length) {
        el(orderList, "p", t.empty);
        return;
      }

      orders.forEach(function (order) {
        var card = el(orderList, "article", "", "panel");
        card.style.cssText =
          "padding:14px;margin-bottom:12px;" +
          "border:1px solid var(--line,#20375c);" +
          "border-radius:12px;";

        var typeName = t.types[order.edit_type] ||
          order.edit_type || "Edit";

        var packName = t.packs[order.package] ||
          order.package || "";

        el(
          card,
          "strong",
          packName + " · " + typeName + " · " +
          String(order.id || "").slice(0, 8)
        );

        var statusName = t.statuses[order.status] ||
          order.status || t.statuses.new;

        var progress = Number(order.progress || 0);

        el(card, "p", statusName + " · " + progress + " %", "note");
        el(card, "p", order.details || "");

        if (!isAdmin) return;

        el(
          card,
          "p",
          "User ID: " + String(order.user_id || "").slice(0, 8),
          "note"
        );

        var statusSelect = el(card, "select");
        styleField(statusSelect);
        fillSelect(
          statusSelect,
          statusKeys,
          t.statuses,
          order.status || "new"
        );

        var progressInput = el(card, "input");
        progressInput.type = "number";
        progressInput.min = "0";
        progressInput.max = "100";
        progressInput.value = String(progress);
        progressInput.setAttribute("aria-label", t.progress);
        styleField(progressInput);

        var save = el(card, "button", t.save, "btn");
        save.type = "button";

        save.onclick = async function () {
          var value = parseInt(progressInput.value, 10);
          if (!Number.isFinite(value)) value = 0;
          value = Math.max(0, Math.min(100, value));

          save.disabled = true;

          try {
            var updated = await sb
              .from("orders")
              .update({
                status: statusSelect.value,
                progress: value
              })
              .eq("id", order.id);

            if (updated.error) {
              showError(card, updated.error);
              return;
            }

            await loadOrders();
          } catch (error) {
            showError(card, error);
          } finally {
            save.disabled = false;
          }
        };
      });
    } catch (error) {
      showError(orderList, error);
    }
  }

  function render() {
    var t = tr();
    panel.textContent = "";

    var header = el(panel, "div");
    header.style.cssText =
      "display:flex;align-items:center;" +
      "justify-content:space-between;gap:12px;";

    el(header, "h3", t.account);

    var topClose = el(header, "button", "✕", "btn");
    topClose.type = "button";
    topClose.setAttribute("aria-label", t.close);
    topClose.onclick = closeWindow;

    var form = el(panel, "div", "", "panel");
    form.style.cssText =
      "padding:16px;border-radius:12px;" +
      "border:1px solid var(--line,#20375c);";

    el(form, "h4", t.order);
    el(form, "label", t.type);

    var typeSelect = el(form, "select");
    styleField(typeSelect);
    fillSelect(typeSelect, typeKeys, t.types, "minecraft");

    el(form, "label", t.pack);

    var packageSelect = el(form, "select");
    styleField(packageSelect);
    fillSelect(packageSelect, packKeys, t.packs, "pro");

    var projectTitle = el(form, "input");
    projectTitle.type = "text";
    projectTitle.maxLength = 120;
    projectTitle.placeholder = t.title;
    styleField(projectTitle);

    var details = el(form, "textarea");
    details.rows = 5;
    details.maxLength = 4000;
    details.placeholder = t.details;
    styleField(details);

    var materialLink = el(form, "input");
    materialLink.type = "url";
    materialLink.maxLength = 1000;
    materialLink.placeholder = t.link;
    styleField(materialLink);

    var message = el(form, "p", "", "note");
    message.setAttribute("role", "status");

    var send = el(form, "button", t.send, "btn main");
    send.type = "button";

    el(form, "p", t.note, "note");

    send.onclick = async function () {
      if (!userId) {
        message.textContent = t.error;
        return;
      }

      var description = details.value.trim();
      var title = projectTitle.value.trim();
      var url = materialLink.value.trim();

      if (!description) {
        message.textContent = t.error;
        details.focus();
        return;
      }

      if (url) {
        try {
          var parsed = new URL(url);
          if (parsed.protocol !== "https:" &&
              parsed.protocol !== "http:") {
            throw new Error("Invalid URL");
          }
        } catch (error) {
          message.textContent = t.error;
          materialLink.focus();
          return;
        }
      }

      var fullDetails =
        (title ? "Projekt: " + title + "\n\n" : "") +
        description +
        (url ? "\n\nMateriály: " + url : "");

      send.disabled = true;
      message.textContent = t.loading;

      try {
        var result = await sb.from("orders").insert({
          user_id: userId,
          edit_type: typeSelect.value,
          package: packageSelect.value,
          details: fullDetails
        });

        if (result.error) {
          showError(message, result.error);
          return;
        }

        projectTitle.value = "";
        details.value = "";
        materialLink.value = "";
        message.textContent = t.success;

        await loadOrders();
      } catch (error) {
        showError(message, error);
      } finally {
        send.disabled = false;
      }
    };

    el(panel, "h4", isAdmin ? t.all : t.mine);

    orderList = el(panel, "div");

    var close = el(panel, "button", t.close, "btn");
    close.type = "button";
    close.style.marginTop = "12px";
    close.onclick = closeWindow;

    loadOrders();
  }

  async function openProfile() {
    if (opening) return;
    opening = true;

    try {
      var sessionResult = await sb.auth.getSession();
      var session =
        sessionResult.data && sessionResult.data.session;

      if (!session || !session.user) {
        closeWindow();
        return;
      }

      userId = session.user.id;

      // Otvor okno hneď; načítanie roly prebehne následne.
      openWindow();
      panel.textContent = tr().loading;
      isAdmin = false;

      try {
        var roleResult = await sb
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (!roleResult.error) {
          isAdmin = !!(
            roleResult.data &&
            roleResult.data.role === "admin"
          );
        } else {
          console.warn(
            "PIXELON: Nepodarilo sa načítať rolu.",
            roleResult.error
          );
        }
      } catch (error) {
        console.warn("PIXELON: Chyba pri načítaní roly.", error);
      }

      render();

      var firstInput = panel.querySelector("select, input, textarea, button");
      if (firstInput) firstInput.focus();
    } catch (error) {
      console.error("PIXELON: Profil sa nepodarilo otvoriť.", error);
      openWindow();
      panel.textContent = tr().error;
    } finally {
      opening = false;
    }
  }

  function updateSession(session) {
    userId = session && session.user ? session.user.id : null;
    profileButton.style.display = userId ? "" : "none";

    if (!userId) {
      closeWindow();
      panel.textContent = "";
      orderList = null;
      isAdmin = false;
    }
  }

  profileButton.addEventListener("click", openProfile);

  sb.auth.getSession()
    .then(function (result) {
      updateSession(result.data && result.data.session);
    })
    .catch(function (error) {
      console.error("PIXELON: Nepodarilo sa načítať reláciu.", error);
    });

  sb.auth.onAuthStateChange(function (event, session) {
    updateSession(session);
  });

  document.querySelectorAll(".lang button").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!overlay.hidden && userId) render();
    });
  });
})();
