const accessCodeInput = document.querySelector("#adminAccessCode");
const loadButton = document.querySelector("#loadAdmin");
const refreshButton = document.querySelector("#refreshAdmin");
const adminMessage = document.querySelector("#adminMessage");
const adminList = document.querySelector("#adminList");
const adminTableBody = document.querySelector("#adminTableBody");
const totalCount = document.querySelector("#totalCount");
const visibleCount = document.querySelector("#visibleCount");
const paidCount = document.querySelector("#paidCount");
const pendingCount = document.querySelector("#pendingCount");
const genderCount = document.querySelector("#genderCount");
const savedCount = document.querySelector("#savedCount");
const baptizedCount = document.querySelector("#baptizedCount");
const churchCount = document.querySelector("#churchCount");
const summaryBars = document.querySelector("#summaryBars");
const churchBreakdown = document.querySelector("#churchBreakdown");
const responseSearch = document.querySelector("#responseSearch");
const paymentFilter = document.querySelector("#paymentFilter");
const genderFilter = document.querySelector("#genderFilter");
const savedFilter = document.querySelector("#savedFilter");
const baptizedFilter = document.querySelector("#baptizedFilter");
const resetFiltersButton = document.querySelector("#resetFilters");
const exportCsvButton = document.querySelector("#exportCsv");
const copySummaryButton = document.querySelector("#copySummary");

let allRegistrations = [];
let visibleRegistrations = [];

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

function percent(part, total) {
  if (total === 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function getChurchEntries(registrations) {
  const counts = new Map();

  registrations.forEach((item) => {
    counts.set(item.church, (counts.get(item.church) || 0) + 1);
  });

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
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
    adminTableBody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">조건에 맞는 응답이 없습니다.</td></tr>';
    adminList.innerHTML = '<p class="empty">조건에 맞는 응답이 없습니다.</p>';
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

function renderSummaryBars(registrations) {
  const total = registrations.length;
  const paid = registrations.filter((item) => item.paymentConfirmed).length;
  const saved = registrations.filter((item) => item.isSaved).length;
  const baptized = registrations.filter((item) => item.isBaptized).length;
  const male = registrations.filter((item) => item.gender === "남").length;
  const rows = [
    ["입금 완료", paid, total, "success"],
    ["구원 예", saved, total, "success"],
    ["침례 예", baptized, total, "success"],
    ["남성", male, total, "muted"],
  ];

  if (total === 0) {
    summaryBars.innerHTML = '<p class="empty">조건에 맞는 응답이 없습니다.</p>';
    return;
  }

  summaryBars.innerHTML = rows
    .map(([label, count, rowTotal, tone]) => {
      const ratio = percent(count, rowTotal);
      return `
        <div class="summary-bar-row">
          <div>
            <strong>${label}</strong>
            <span>${count}/${rowTotal}명 (${ratio}%)</span>
          </div>
          <div class="summary-track" data-tone="${tone}">
            <span style="width: ${ratio}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderChurchBreakdown(registrations) {
  const entries = getChurchEntries(registrations);
  const maxCount = entries[0]?.[1] || 0;

  if (entries.length === 0) {
    churchBreakdown.innerHTML = '<p class="empty">조건에 맞는 응답이 없습니다.</p>';
    return;
  }

  churchBreakdown.innerHTML = entries
    .map(([church, count]) => {
      const width = maxCount ? Math.max(8, Math.round((count / maxCount) * 100)) : 0;
      return `
        <div class="church-row">
          <div>
            <strong>${escapeHtml(church)}</strong>
            <span>${count}명</span>
          </div>
          <div class="summary-track">
            <span style="width: ${width}%"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderAdminStats(registrations, filteredRegistrations = registrations) {
  const paid = filteredRegistrations.filter((item) => item.paymentConfirmed).length;
  const pending = filteredRegistrations.length - paid;
  const male = filteredRegistrations.filter((item) => item.gender === "남").length;
  const female = filteredRegistrations.filter((item) => item.gender === "여").length;
  const saved = filteredRegistrations.filter((item) => item.isSaved).length;
  const baptized = filteredRegistrations.filter((item) => item.isBaptized).length;
  const churches = getChurchEntries(filteredRegistrations).length;

  totalCount.textContent = registrations.length;
  visibleCount.textContent = filteredRegistrations.length;
  paidCount.textContent = paid;
  pendingCount.textContent = pending;
  genderCount.textContent = `${male} / ${female}`;
  savedCount.textContent = saved;
  baptizedCount.textContent = baptized;
  churchCount.textContent = churches;
  renderSummaryBars(filteredRegistrations);
  renderChurchBreakdown(filteredRegistrations);
}

function getFilteredRegistrations() {
  const query = responseSearch.value.trim().toLowerCase();
  const payment = paymentFilter.value;
  const gender = genderFilter.value;
  const saved = savedFilter.value;
  const baptized = baptizedFilter.value;

  return allRegistrations.filter((item) => {
    const matchesQuery = !query
      || [item.name, item.church, item.phone, formatPhoneNumber(item.phone)]
        .some((value) => String(value ?? "").toLowerCase().includes(query));
    const matchesPayment = payment === "all"
      || (payment === "paid" && item.paymentConfirmed)
      || (payment === "pending" && !item.paymentConfirmed);
    const matchesGender = gender === "all" || item.gender === gender;
    const matchesSaved = saved === "all"
      || (saved === "yes" && item.isSaved)
      || (saved === "no" && !item.isSaved);
    const matchesBaptized = baptized === "all"
      || (baptized === "yes" && item.isBaptized)
      || (baptized === "no" && !item.isBaptized);

    return matchesQuery && matchesPayment && matchesGender && matchesSaved && matchesBaptized;
  });
}

function applyFilters() {
  visibleRegistrations = getFilteredRegistrations();
  renderAdminStats(allRegistrations, visibleRegistrations);
  renderAdminRows(visibleRegistrations);
  setAdminMessage(
    `전체 ${allRegistrations.length}개 중 ${visibleRegistrations.length}개를 표시 중입니다.`,
    "success",
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportVisibleCsv() {
  if (visibleRegistrations.length === 0) {
    setAdminMessage("내보낼 응답이 없습니다.", "error");
    return;
  }

  const header = ["이름", "소속교회", "전화번호", "성별", "구원여부", "침례여부", "입금완료", "신청일"];
  const rows = visibleRegistrations.map((item) => [
    item.name,
    item.church,
    formatPhoneNumber(item.phone),
    item.gender,
    item.isSaved ? "예" : "아니오",
    item.isBaptized ? "예" : "아니오",
    item.paymentConfirmed ? "완료" : "미완료",
    new Date(item.createdAt).toLocaleString("ko-KR"),
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `05-ecclesia-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  setAdminMessage(`${visibleRegistrations.length}개 응답을 CSV로 내보냈습니다.`, "success");
}

async function copySummary() {
  const paid = visibleRegistrations.filter((item) => item.paymentConfirmed).length;
  const pendingNames = visibleRegistrations
    .filter((item) => !item.paymentConfirmed)
    .map((item) => `${item.name}(${item.church})`);
  const churches = getChurchEntries(visibleRegistrations)
    .map(([church, count]) => `${church} ${count}명`)
    .join(", ");
  const summary = [
    "제 5회 동기모임 신청 요약",
    `전체 응답: ${allRegistrations.length}개`,
    `현재 보기: ${visibleRegistrations.length}개`,
    `입금 완료: ${paid}개`,
    `미입금: ${visibleRegistrations.length - paid}개`,
    `교회별: ${churches || "없음"}`,
    `미입금자: ${pendingNames.join(", ") || "없음"}`,
  ].join("\n");

  await navigator.clipboard.writeText(summary);
  setAdminMessage("현재 보기 기준 요약을 복사했습니다.", "success");
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

    allRegistrations = body.registrations;
    visibleRegistrations = body.registrations;
    applyFilters();
    setAdminMessage(`총 ${body.registrations.length}개의 응답을 불러왔습니다.`, "success");
  } catch (error) {
    setAdminMessage(error.message, "error");
  }
}

loadButton.addEventListener("click", loadAdminRows);
refreshButton.addEventListener("click", loadAdminRows);
responseSearch.addEventListener("input", applyFilters);
paymentFilter.addEventListener("change", applyFilters);
genderFilter.addEventListener("change", applyFilters);
savedFilter.addEventListener("change", applyFilters);
baptizedFilter.addEventListener("change", applyFilters);
resetFiltersButton.addEventListener("click", () => {
  responseSearch.value = "";
  paymentFilter.value = "all";
  genderFilter.value = "all";
  savedFilter.value = "all";
  baptizedFilter.value = "all";
  applyFilters();
});
exportCsvButton.addEventListener("click", exportVisibleCsv);
copySummaryButton.addEventListener("click", () => {
  copySummary().catch((error) => setAdminMessage(error.message, "error"));
});
accessCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    loadAdminRows();
  }
});
