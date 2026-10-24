(function () {
  if (!window.sb) return;

  var sb = window.sb;

  AU.sk.ck =
    "Poslali sme ti overovací email. Klikni na odkaz v ňom a potom sa prihlás.";
  AU.en.ck =
    "We sent you a verification email. Click the link in it, then log in.";

  ["signUp", "signInWithPassword"].forEach(function (n) {
    var f = sb.auth[n].bind(sb.auth);

    sb.auth[n] = function (a) {
      return f(a).then(function (r) {
        var m = r.error ? " (" + r.error.message + ")" : "";
        AU.sk.bad = "Neplatné údaje alebo chyba." + m;
        AU.en.bad = "Invalid details or an error." + m;
        return r;
      });
    };
  });

  var L = {
    sk: {
      acc: "Môj účet",
      ord: "Nová objednávka",
      type: "Typ editu",
      package: "Balík",
      dt: "Opíš svoje zadanie, štýl, dĺžku videa a termín...",
      title: "Názov projektu",
      link: "Odkaz na video alebo materiály (nepovinné)",
      go: "Odoslať objednávku",
      my: "Moje objednávky",
      none: "Zatiaľ žiadne objednávky.",
      ok: "Objednávka bola odoslaná.",
      err: "Nepodarilo sa odoslať objednávku.",
      adm: "Administrácia: všetky objednávky",
      sv: "Uložiť",
      cl: "Zavrieť",
      pr: "Postup %",
      cu: "Individuálna ponuka",
      note: "Cenu potvrdíme po prijatí objednávky. Platba zatiaľ nie je zapnutá.",
      choose: "Vyber typ editu",
      custom: "Doplňujúce informácie",
      st: {
        new: "Nová objednávka",
        waiting_payment: "Čaká na platbu",
        waiting_materials: "Čaká na materiály",
        assigned: "Priradená editorovi",
        in_progress: "Prebieha editovanie",
        review: "Kontrola",
        revisions: "Požadované úpravy",
        done: "Dokončená",
        cancelled: "Zrušená"
      },
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
      }
    },

    en: {
      acc: "My account",
      ord: "New order",
      type: "Edit type",
      package: "Package",
      dt: "Describe the project, style, video length and deadline...",
      title: "Project name",
      link: "Video or materials link (optional)",
      go: "Submit order",
      my: "My orders",
      none: "No orders yet.",
      ok: "Order submitted successfully.",
      err: "Could not submit the order.",
      adm: "Admin: all orders",
      sv: "Save",
      cl: "Close",
      pr: "Progress %",
      cu: "Custom offer",
      note: "The price will be confirmed after receiving the order. Payments are not enabled yet.",
      choose: "Choose edit type",
      custom: "Additional information",
      st: {
        new: "New order",
        waiting_payment: "Waiting for payment",
        waiting_materials: "Waiting for materials",
        assigned: "Assigned to editor",
        in_progress: "Editing",
        review: "Review",
        revisions: "Revisions requested",
        done: "Completed",
        cancelled: "Cancelled"
      },
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
      }
    }
  };

  function T() {
    return L[window.lang] ? L[window.lang] : L.sk;
  }

  var statuses = [
    "new",
    "waiting_payment",
    "waiting_materials",
    "assigned",
    "in_progress",
    "review",
    "revisions",
    "done",
    "cancelled"
  ];

  var editTypes = [
    "minecraft",
    "youtube",
    "shorts",
    "tiktok",
    "amv",
    "cinematic",
    "intro",
    "promo",
    "music",
    "other"
  ];

  var packages = ["basic", "pro", "premium", "custom"];

  function E(parent, tag, text, cls) {
    var el = document.createElement(tag);

    if (text !== undefined && text !== null && text !== "") {
      el.textContent = text;
    }

    if (cls) el.className = cls;

    parent.appendChild(el);
    return el;
  }

  function styleField(el) {
    el.style.cssText =
      "display:block;width:100%;box-sizing:border-box;" +
      "padding:13px;margin:8px 0;border-radius:10px;" +
      "border:1px solid var(--line,#20375c);" +
      "background:#060d1c;color:var(--text,#e6efff);" +
      "font:inherit;";
  }

  function addOptions(select, keys, labels, selected) {
    keys.forEach(function (key) {
      var option = E(select, "option", labels[key]);
      option.value = key;

      if (key === selected) option.selected = true;
    });
  }

  // Modrá ikonka profilu
  var cb = document.createElement("button");
  cb.type = "button";
  cb.className = "btn";
  cb.textContent = "👤";
  cb.title = "Môj účet";
  cb.setAttribute("aria-label", "Môj účet");
  cb.style.cssText =
    "padding:6px 10px;min-height:36px;font-size:14px;" +
    "display:none;border-color:#299df4;color:#299df4;";

  var nav = document.querySelector("nav");

  if (nav) {
    var referenceButton = nav.querySelector(".btn");

    if (referenceButton) {
      nav.insertBefore(cb, referenceButton);
    } else {
      nav.appendChild(cb);
    }
  }

  // Panel účtu
  var panel = document.createElement("div");
  panel.className = "own-p";
  panel.hidden = true;

  panel.style.cssText =
    "position:relative;z-index:20;max-width:900px;" +
    "margin:20px auto;padding:20px;";

  document.body.appendChild(panel);

  var uid = null;
  var isAdmin = false;
  var listContainer = null;
  var currentUser = null;

  function render() {
    var t = T();

    panel.textContent = "";

    E(panel, "h3", t.acc);

    // Formulár objednávky
    var form = E(panel, "div", "", "panel");
    form.style.marginBottom = "16px";

    E(form, "h4", t.ord);

    E(form, "label", t.type);

    var typeSelect = E(form, "select");
    styleField(typeSelect);
    addOptions(typeSelect, editTypes, t.types, "minecraft");

    E(form, "label", t.package);

    var packageSelect = E(form, "select");
    styleField(packageSelect);
    addOptions(packageSelect, packages, t.packs, "pro");

    var projectTitle = E(form, "input");
    projectTitle.type = "text";
    projectTitle.placeholder = t.title;
    projectTitle.maxLength = 120;
    styleField(projectTitle);

    var details = E(form, "textarea");
    details.rows = 5;
    details.placeholder = t.dt;
    details.maxLength = 4000;
    styleField(details);

    var link = E(form, "input");
    link.type = "url";
    link.placeholder = t.link;
    link.maxLength = 1000;
    styleField(link);

    var message = E(form, "p");
    message.className = "note";
    message.setAttribute("role", "status");

    var submit = E(form, "button", t.go, "btn main");
    submit.type = "button";
    submit.style.marginTop = "8px";

    E(form, "p", t.note, "note");

    submit.onclick = function () {
      var description = details.value.trim();
      var title = projectTitle.value.trim();
      var materialLink = link.value.trim();

      if (!uid) {
        message.textContent = t.err;
        return;
      }

      if (!description) {
        message.textContent = t.err;
        details.focus();
        return;
      }

      if (materialLink) {
        try {
          var parsed = new URL(materialLink);

          if (
            parsed.protocol !== "https:" &&
            parsed.protocol !== "http:"
          ) {
            throw new Error("Invalid URL");
          }
        } catch (e) {
          message.textContent = t.err;
          link.focus();
          return;
        }
      }

      submit.disabled = true;
      message.textContent = "";

      var fullDetails =
        (title ? "Projekt: " + title + "\n\n" : "") +
        description +
        (materialLink
          ? "\n\nMateriály: " + materialLink
          : "");

      sb.from("orders")
        .insert({
          user_id: uid,
          edit_type: typeSelect.value,
          package: packageSelect.value,
          details: fullDetails
        })
        .then(function (result) {
          submit.disabled = false;

          if (result.error) {
            console.error("PIXELON order error:", result.error);
            message.textContent = t.err;
            return;
          }

          details.value = "";
          projectTitle.value = "";
          link.value = "";

          message.textContent = t.ok;
          loadOrders();
        })
        .catch(function (error) {
          console.error(error);
          submit.disabled = false;
          message.textContent = t.err;
        });
    };

    E(panel, "h4", isAdmin ? t.adm : t.my);

    listContainer = E(panel, "div");

    var close = E(panel, "button", t.cl, "btn");
    close.type = "button";
    close.style.marginTop = "12px";

    close.onclick = function () {
      panel.hidden = true;
    };

    loadOrders();
  }

  function loadOrders() {
    if (!listContainer || !uid) return;

    var t = T();
    listContainer.textContent = "Načítavam…";

    var query = sb
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Bežný používateľ načíta iba svoje objednávky.
    // Administrátor môže načítať všetky, ak to povoľujú RLS pravidlá.
    if (!isAdmin) {
      query = query.eq("user_id", uid);
    }

    query.then(function (result) {
      listContainer.textContent = "";

      if (result.error) {
        console.error("PIXELON orders error:", result.error);
        E(listContainer, "p", t.err);
        return;
      }

      var orders = result.data || [];

      if (!orders.length) {
        E(listContainer, "p", t.none);
        return;
      }

      orders.forEach(function (order) {
        var card = E(listContainer, "div", "", "panel");
        card.style.marginBottom = "12px";

        var typeName =
          t.types[order.edit_type] ||
          order.edit_type ||
          "Edit";

        var packageName =
          t.packs[order.package] ||
          order.package ||
          "";

        E(
          card,
          "strong",
          packageName + " · " + typeName + " · " +
            String(order.id || "").slice(0, 8)
        );

        var statusText =
          t.st[order.status] || order.status || t.st.new;

        var progress = Number(order.progress || 0);

        E(
          card,
          "div",
          statusText + " · " + progress + " %",
          "note"
        );

        E(card, "p", order.details || "");

        if (isAdmin) {
          E(
            card,
            "div",
            "user: " + String(order.user_id || "").slice(0, 8),
            "note"
          );

          var statusSelect = E(card, "select");
          styleField(statusSelect);

          statuses.forEach(function (status) {
            var option = E(
              statusSelect,
              "option",
              t.st[status] || status
            );

            option.value = status;
            option.selected = status === order.status;
          });

          var progressInput = E(card, "input");
          progressInput.type = "number";
          progressInput.min = "0";
          progressInput.max = "100";
          progressInput.value = String(progress);
          progressInput.setAttribute("aria-label", t.pr);
          styleField(progressInput);

          var save = E(card, "button", t.sv, "btn");
          save.type = "button";

          save.onclick = function () {
            var value = parseInt(progressInput.value, 10);

            if (!Number.isFinite(value)) value = 0;

            value = Math.max(0, Math.min(100, value));

            save.disabled = true;

            sb.from("orders")
              .update({
                status: statusSelect.value,
                progress: value
              })
              .eq("id", order.id)
              .then(function (updateResult) {
                save.disabled = false;

                if (updateResult.error) {
                  console.error(updateResult.error);
                  save.textContent = t.err;
                  return;
                }

                save.textContent = t.ok;
                loadOrders();
              })
              .catch(function (error) {
                console.error(error);
                save.disabled = false;
                save.textContent = t.err;
              });
          };
        }
      });
    }).catch(function (error) {
      console.error(error);
      listContainer.textContent = t.err;
    });
  }

  function handleSession(session) {
    currentUser = session && session.user ? session.user : null;
    uid = currentUser ? currentUser.id : null;

    cb.style.display = uid ? "" : "none";

    if (!uid) {
      panel.hidden = true;
      listContainer = null;
    }
  }

  sb.auth.getSession().then(function (result) {
    handleSession(result.data && result.data.session);
  });

  sb.auth.onAuthStateChange(function (event, session) {
    handleSession(session);
  });

cb.onclick = async function () {
  if (!uid) {
    var result = await sb.auth.getSession();
    var session = result.data && result.data.session;

    if (!session || !session.user) {
      panel.hidden = true;
      return;
    }

    uid = session.user.id;
  }

  // Otvorenie profilu hneď po kliknutí
  panel.hidden = false;
  panel.textContent = "Načítavam profil…";

  isAdmin = false;

  try {
    var result = await sb
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .maybeSingle();

    if (!result.error) {
      isAdmin = !!(
        result.data &&
        result.data.role === "admin"
      );
    }
  } catch (error) {
    console.error("PIXELON profile error:", error);
  }

  render();
};

  document.querySelectorAll(".lang button").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!panel.hidden && uid) render();
    });
  });
})