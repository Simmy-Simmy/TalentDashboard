// ============================================================
// PASSWORD GATE — vanilla JS, no dependencies.
//
// To change the password, edit SITE_PASSWORD below. That's the
// only line you need to touch to rotate the password.
//
// NOTE: This is a casual access gate only. The password lives in
// this file, which any visitor's browser downloads, so it is not
// real security — it just keeps the page from loading openly.
// ============================================================
(function () {
  var SITE_PASSWORD = "HireGoodPeople!"; // <-- CHANGE THIS PASSWORD
  var SESSION_KEY = "site-unlocked";

  var gate = document.getElementById("password-gate");
  var protectedContent = document.getElementById("protected-content");
  var input = document.getElementById("password-input");
  var submitBtn = document.getElementById("password-submit");
  var errorMsg = document.getElementById("password-error");
  var logoutBtn = document.getElementById("logout-button");

  function showSite() {
    gate.style.display = "none";
    protectedContent.style.display = "";
  }

  function showGate() {
    gate.style.display = "flex";
    protectedContent.style.display = "none";
    input.value = "";
    errorMsg.hidden = true;
    input.focus();
  }

  function attemptLogin() {
    if (input.value === SITE_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      errorMsg.hidden = true;
      showSite();
    } else {
      errorMsg.hidden = false;
      input.value = "";
      input.focus();
    }
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    showGate();
  }

  // Restore session on page load — no re-entry needed mid-visit.
  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showSite();
  } else {
    showGate();
  }

  submitBtn.addEventListener("click", attemptLogin);

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      attemptLogin();
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
})();
