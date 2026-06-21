const accessCodeInput = document.querySelector("#adminAccessCode");
const loadButton = document.querySelector("#loadAdmin");
const refreshButton = document.querySelector("#refreshAdmin");
const adminMessage = document.querySelector("#adminMessage");
const adminList = document.querySelector("#adminList");
const adminTableBody = document.querySelector("#adminTableBody");
const totalCount = document.querySelector("#totalCount");
const paidCount = document.querySelector("#paidCount");
const genderCount = document.querySelector("#genderCount");
const baptizedCount = document.querySelector("#baptizedCount");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setAdminMessage(text, type = "") {
  adminMessage.textContent = text;
  adminMessage.dataset.type = type;
}

function badge(value, tone = "default") {
  return `<span class="admin-status-badge" data-tone="${tone}">${escapeHtml(value)}</span>`;
}

function formatPhoneNumber(value) {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function renderAdminRows(registrations) {
  if (registrations.length === 0) {
    adminTableBody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">아직 응답이 없습니다.</td></tr>';
    adminList.innerHTML = '<p class="empty">아직 응답이 없습니다.</p>';
    return;
  }

  adminTableBody.innerHTML = registrations
    .map(
      (item) => `
        <tr>
          <td><strong>${escapeHtml(item.name)}</strong></td>
          <td>${escapeHtml(item.church)}</td>
          <td>${escapeHtml(formatPhoneNumber(item.phone))}</td>
          <td>${escapeHtml(item.gender)}</td>
          <td>${badge(item.isSaved ? "예" : "아니오", item.isSaved ? "success" : "muted")}</td>
          <td>${badge(item.isBaptized ? "예" : "아니오", item.isBaptized ? "success" : "muted")}</td>
          <td>${badge(item.paymentConfirmed ? "완료" : "미완료", item.paymentConfirmed ? "success" : "warning")}</td>
          <td>${new Date(item.createdAt).toLocaleString("ko-KR")}</td>
        </tr>
      `,
    )
    .join("");

  adminList.innerHTML = registrations
    .map(
      (item) => `
        <article class="admin-row">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.church)} · ${escapeHtml(item.gender)}</small>
          </div>
          <dl>
            <div><dt>전화번호</dt><dd>${escapeHtml(formatPhoneNumber(item.phone))}</dd></div>
            <div><dt>구원 여부</dt><dd>${item.isSaved ? "예" : "아니오"}</dd></div>
            <div><dt>침례 여부</dt><dd>${item.isBaptized ? "예" : "아니오"}</dd></div>
            <div><dt>입금 확인</dt><dd>${item.paymentConfirmed ? "완료" : "미완료"}</dd></div>
            <div><dt>신청일</dt><dd>${new Date(item.createdAt).toLocaleString("ko-KR")}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderAdminStats(registrations) {
  const paid = registrations.filter((item) => item.paymentConfirmed).length;
  const male = registrations.filter((item) => item.gender === "남").length;
  const female = registrations.filter((item) => item.gender === "여").length;
  const baptized = registrations.filter((item) => item.isBaptized).length;

  totalCount.textContent = registrations.length;
  paidCount.textContent = paid;
  genderCount.textContent = `${male} / ${female}`;
  baptizedCount.textContent = baptized;
}

async function loadAdminRows() {
  const accessCode = accessCodeInput.value;
  setAdminMessage("불러오는 중입니다...");

  try {
    const response = await fetch("/api/admin/registrations", {
      headers: { "x-admin-access-code": accessCode },
    });
    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.message || "관리자 조회에 실패했습니다.");
    }

    renderAdminStats(body.registrations);
    renderAdminRows(body.registrations);
    setAdminMessage(`총 ${body.registrations.length}개의 응답을 불러왔습니다.`, "success");
  } catch (error) {
    setAdminMessage(error.message, "error");
  }
}

loadButton.addEventListener("click", loadAdminRows);
refreshButton.addEventListener("click", loadAdminRows);
accessCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadAdminRows();
  }
});
