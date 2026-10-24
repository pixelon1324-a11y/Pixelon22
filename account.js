
(function () {
  "use strict";

  if (!window.sb) {
    console.error("PIXELON: Supabase klient nie je dostupný.");
    return;
  }

  var sb = window.sb;

  var L = {
    sk: {
      account: "Môj účet",
      newOrder: "Nová objednávka",
      editType: "Typ editu",
      package: "Balík",
      title: "Názov projektu",
      details: "Opíš zadanie, štýl, dĺžku videa a termín...",
      link: "Odkaz na video alebo materiály (nepovinné)",
      send: "Odoslať objednávku",
      myOrders: "Moje objednávky",
      allOrders: "Administrácia — všetky objednávky",
      empty: "Zatiaľ žiadne objednávky.",
      loading: "Načítavam...",
      success: "Objednávka bola odoslaná.",
      error: "Operácia sa nepodarila.",
      save: "Uložiť",
      close: "Zavrieť",
      progress: "Postup v %",
      paymentNote: "Cenu potvrdíme po prijatí objednávky. Platby zatiaľ nie sú zapnuté.",
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
      packages: {
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
      newOrder: "New order",
      editType: "Edit type",
      package: "Package",
      title: "Project name",
      details: "Describe the project, style, video length and deadline...",
      link: "Video or materials link (optional)",
      send: "Submit order",
      myOrders: "My orders",
      allOrders: "Admin — all orders",
      empty: "No orders yet.",
      loading: "Loading...",
      success: "Order submitted successfully.",
      error: "The operation failed.",
      save: "Save",
      close: "Close",
      progress: "Progress %",
      paymentNote: "The price will be confirmed after receiving the order. Payments are not enabled yet.",
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
      packages: {
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
    var language = window.lang || "sk";
    return L[language] || L.sk;
  }

  var typeKeys = [
    "minecraft", "youtube", "shorts", "tiktok", "amv",
    "cinematic", "intro", "promo", "music", "other"
  ];

  var packageKeys = ["basic", "pro", "premium", "custom"];

  var statusKeys = [
    "new", "waiting_payment", "waiting_materials",
    "assigned", "in_progress", "review",
    "revisions", "done", "cancelled"
  ];

  function element(parent, tag, text, className) {
    var el = document.createElement(tag);

    if (text !== undefined && text !== null) {
      el.textContent = text;
    }

    if (className) el.className = className;

    parent.appendChild(el);
    return el;
  }

  function fieldStyle(el) {
    el.style.cssText =
      "display:block;width:100%;box-sizing:border-box;" +
      "padding:12px;margin:8px 0;border-radius:9px;" +
      "border:1px solid var(--line,#20375c);" +
      "background:#060d1c;color:var(--text,#e6efff);" +
      "font:inherit;";
  }

  function fillSelect(select, keys, labels, selected) {
    keys.forEach(function (key) {
      var option = element(select, "option", labels[key]);
      option.value = key;
      option.selected = key === selected;
    });
  }

  // Modrá ikonka profilu
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
    var referenceButton = nav.querySelector(".btn");

    if (referenceButton) {
      nav.insertBefore(profileButton, referenceButton);
    } else {
      nav.appendChild(profileButton);
    }
  }

  // Panel profilu
  var panel = document.createElement("section");
  panel.className = "own-p";
  panel.hidden = true;
  panel.style.cssText =
    "position:relative;z-index:20;max-width:900px;" +
    "margin:20px auto;padding:20px;" +
    "color:var(--text,#e6efff);";

  document.body.appendChild(panel);

  var userId = null;
  var isAdmin = false;
  var orderList = null;
  var opening = false;

  function showError(container, error) {
    console.error("PIXELON:", error);
    container.textContent = tr().error;
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
        element(orderList, "p", t.empty);
        return;
      }

      orders.forEach(function (order) {
        var card = element(orderList, "article", "", "panel");
        card.style.marginBottom = "12px";
        card.style.padding = "14px";

        var editName =
          t.types[order.edit_type] ||
          order.edit_type ||
          "Edit";

        var packageName =
          t.packages[order.package] ||
          order.package ||
          "";

        element(
          card,
          "strong",
          packageName + " · " + editName +
          " · " + String(order.id || "").slice(0, 8)
        );

        var statusName =
          t.statuses[order.status] ||
          order.status ||
          t.statuses.new;

        var progress = Number(order.progress || 0);

        element(
          card,
          "p",
          statusName + " · " + progress + " %",
          "note"
        );

        element(card, "p", order.details || "");

        if (!isAdmin) return;

        element(
          card,
          "p",
          "ID používateľa: " +
          String(order.user_id || "").slice(0, 8),
          "note"
        );

        var statusSelect = element(card, "select");
        fieldStyle(statusSelect);

        fillSelect(
          statusSelect,
          statusKeys,
          t.statuses,
          order.status || "new"
        );

        var progressInput = element(card, "input");
        progressInput.type = "number";
        progressInput.min = "0";
        progressInput.max = "100";
        progressInput.value = String(progress);
        progressInput.setAttribute("aria-label", t.progress);
        fieldStyle(progressInput);

        var saveButton = element(card, "button", t.save, "btn");
        saveButton.type = "button";

        saveButton.onclick = async function () {
          var value = parseInt(progressInput.value, 10);

          if (!Number.isFinite(value)) value = 0;
          value = Math.max(0, Math.min(100, value));

          saveButton.disabled = true;

          try {
            var updateResult = await sb
              .from("orders")
              .update({
                status: statusSelect.value,
                progress: value
              })
              .eq("id", order.id);

            if (updateResult.error) {
              showError(card, updateResult.error);
              return;
            }

            await loadOrders();
          } catch (error) {
            showError(card, error);
          } finally {
            saveButton.disabled = false;
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

    element(panel, "h3", t.account);

    var form = element(panel, "div", "", "panel");
    form.style.padding = "16px";

    element(form, "h4", t.newOrder);

    element(form, "label", t.editType);

    var typeSelect = element(form, "select");
    fieldStyle(typeSelect);
    fillSelect(typeSelect, typeKeys, t.types, "minecraft");

    element(form, "label", t.package);

    var packageSelect = element(form, "select");
    fieldStyle(packageSelect);
    fillSelect(packageSelect, packageKeys, t.packages, "pro");

    var projectName = element(form, "input");
    projectName.type = "text";
    projectName.maxLength = 120;
    projectName.placeholder = t.title;
    fieldStyle(projectName);

    var description = element(form, "textarea");
    description.rows = 5;
    description.maxLength = 4000;
    description.placeholder = t.details;
    fieldStyle(description);

    var materialsLink = element(form, "input");
    materialsLink.type = "url";
    materialsLink.maxLength = 1000;
    materialsLink.placeholder = t.link;
    fieldStyle(materialsLink);

    var message = element(form, "p", "", "note");
    message.setAttribute("role", "status");

    var sendButton = element(form, "button", t.send, "btn main");
    sendButton.type = "button";

    element(form, "p", t.paymentNote, "note");

    sendButton.onclick = async function () {
      if (!userId) {
        message.textContent = t.error;
        return;
      }

      var text = description.value.trim();
      var title = projectName.value.trim();
      var url = materialsLink.value.trim();

      if (!text) {
        message.textContent = t.error;
        description.focus();
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
          materialsLink.focus();
          return;
        }
      }

      var fullDetails =
        (title ? "Projekt: " + title + "\n\n" : "") +
        text +
        (url ? "\n\nMateriály: " + url : "");

      sendButton.disabled = true;
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

        projectName.value = "";
        description.value = "";
        materialsLink.value = "";
        message.textContent = t.success;

        await loadOrders();
      } catch (error) {
        showError(message, error);
      } finally {
        sendButton.disabled = false;
      }
    };

    element(panel, "h4", isAdmin ? t.allOrders : t.myOrders);

    orderList = element(panel, "div");

    var closeButton = element(panel, "button", t.close, "btn");
    closeButton.type = "button";
    closeButton.style.marginTop = "12px";
    closeButton.onclick = function () {
      panel.hidden = true;
    };

    loadOrders();
  }

  async function openProfile() {
    if (opening) return;
    opening = true;

    try {
      // Získame aktuálnu reláciu aj v prípade,
      // že sa stav prihlásenia ešte nestihol načítať.
      var sessionResult = await sb.auth.getSession();
      var session =
        sessionResult.data && sessionResult.data.session;

      if (!session || !session.user) {
        panel.hidden = true;
        return;
      }

      userId = session.user.id;

      // Panel sa otvorí ešte pred načítaním roly.
      panel.hidden = false;
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
            "PIXELON: Rolu sa nepodarilo načítať.",
            roleResult.error
          );
        }
      } catch (error) {
        console.warn("PIXELON: Chyba pri načítaní roly.", error);
      }

      render();
    } catch (error) {
      console.error("PIXELON: Profil sa nepodarilo otvoriť.", error);
      panel.hidden = false;
      panel.textContent = tr().error;
    } finally {
      opening = false;
    }
  }

  function updateSession(session) {
    userId = session && session.user ? session.user.id : null;

    profileButton.style.display = userId ? "" : "none";

    if (!userId) {
      panel.hidden = true;
      panel.textContent = "";
      orderList = null;
      isAdmin = false;
    }
  }

  profileButton.addEventListener("click", openProfile);

  sb.auth.getSession().then(function (result) {
    updateSession(result.data && result.data.session);
  }).catch(function (error) {
    console.error("PIXELON: Nepodarilo sa načítať reláciu.", error);
  });

  sb.auth.onAuthStateChange(function (event, session) {
    updateSession(session);
  });

  document.querySelectorAll(".lang button").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!panel.hidden && userId) render();
    });
  });
})();
