(function () {
  if (document.body.dataset.page === "admin") return;
  if (typeof PortalAPI === "undefined") return;

  const visitor = PortalAPI.getVisitor();
  if (visitor) {
    showGreeting(visitor);
    return;
  }

  document.body.classList.add("is-gated");
  const gate = document.createElement("div");
  gate.className = "access-gate";
  gate.innerHTML = `
    <form class="form-card access-card" id="access-form">
      <p class="hero-kicker" style="color:var(--blue-dark);letter-spacing:.18em">Staff Gate</p>
      <h1>職員番号を入力してください</h1>
      <p class="section-lead">登録された職員番号を入力すると、ポータルを閲覧できます。</p>
      <label for="staff-id">職員番号</label>
      <input id="staff-id" name="staffId" type="text" inputmode="numeric" autocomplete="off" required>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit">入場する</button>
      </div>
      <p class="error" id="access-error"></p>
    </form>`;
  document.body.appendChild(gate);

  const form = document.getElementById("access-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("access-error");
    const staffId = form.staffId.value.trim();
    err.textContent = "確認しています…";
    try {
      const data = await PortalAPI.enterPortal(staffId);
      document.body.classList.remove("is-gated");
      gate.remove();
      showGreeting(data);
    } catch (ex) {
      err.textContent = ex.message;
    }
  });

  function showGreeting(data) {
    const box = document.getElementById("visitor-box");
    const greet = document.getElementById("visitor-greet");
    const exitBtn = document.getElementById("visitor-exit");
    if (!box || !greet) return;
    greet.textContent = data.greeting || (data.name ? data.name + "さん、ようこそ" : "ようこそ");
    box.hidden = false;
    if (exitBtn) {
      exitBtn.onclick = () => {
        PortalAPI.leavePortal();
        location.reload();
      };
    }
  }
})();
