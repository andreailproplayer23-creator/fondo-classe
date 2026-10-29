import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    updateDoc,
    arrayUnion,
    arrayRemove,
    query, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// ⚠️ INSERISCI LA TUA EMAIL GOOGLE ADMIN
const ADMIN_EMAIL = "andrea.ilproplayer23@gmail.com";

// 🔐 IMPOSTA QUI IL TUO PIN PER ACCEDERE AL PANNELLO ADMIN
const ADMIN_PIN = "23012013";

// ⚠️ INSERISCI LE TUE CHIAVI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAjuupS2Wdfw5bwbrNTNYs6u4EvoTluVvU",
  authDomain: "fondo-classe-b5085.firebaseapp.com",
  projectId: "fondo-classe-b5085",
  storageBucket: "fondo-classe-b5085.firebasestorage.app",
  messagingSenderId: "610301786910",
  appId: "1:610301786910:web:eda577bf473ddd7da8270f",
  measurementId: "G-EN4W3ZZE9T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementi DOM Base
const userNameElement = document.getElementById("user-name");
const userRoleElement = document.getElementById("user-role");
const logoutBtn = document.getElementById("logout-btn");
const totalBalanceEl = document.getElementById("total-balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const transactionsListEl = document.getElementById("transactions-list");

// Admin PIN & Card DOM
const openAdminPinBtn = document.getElementById("open-admin-pin-btn");
const adminPinModal = document.getElementById("admin-pin-modal");
const closePinModalBtn = document.getElementById("close-pin-modal");
const pinForm = document.getElementById("pin-form");
const adminPinInput = document.getElementById("admin-pin-input");
const adminCard = document.getElementById("admin-management-card");
const closeAdminPanelBtn = document.getElementById("close-admin-panel-btn");
const addAdminForm = document.getElementById("add-admin-form");
const adminEmailInput = document.getElementById("admin-email-input");
const adminsListEl = document.getElementById("admins-list");

// Filtri DOM
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");
const filterType = document.getElementById("filter-type");
const exportPdfBtn = document.getElementById("export-pdf-btn");

// Avvisi DOM
const openNoticeModalBtn = document.getElementById("open-notice-modal-btn");
const noticeModal = document.getElementById("notice-modal");
const closeNoticeModalBtn = document.getElementById("close-notice-modal");
const addNoticeForm = document.getElementById("add-notice-form");
const noticeTitleInput = document.getElementById("notice-title-input");
const noticeDescInput = document.getElementById("notice-desc-input");
const noticesListEl = document.getElementById("notices-list");

// Studenti DOM
const addStudentForm = document.getElementById("add-student-form");
const studentNameInput = document.getElementById("student-name-input");
const studentsListEl = document.getElementById("students-list");
const studentsCountEl = document.getElementById("students-count");

// Raccolte DOM
const openCollectionBtn = document.getElementById("open-collection-modal");
const collectionModal = document.getElementById("collection-modal");
const closeCollectionModalBtn = document.getElementById("close-collection-modal");
const collectionForm = document.getElementById("collection-form");
const collectionsContainer = document.getElementById("collections-container");

// Modale Transazioni
const modal = document.getElementById("transaction-modal");
const modalTitle = document.getElementById("modal-title");
const openIncomeBtn = document.getElementById("open-income-modal");
const openExpenseBtn = document.getElementById("open-expense-modal");
const closeModalBtn = document.getElementById("close-modal");
const transactionForm = document.getElementById("transaction-form");
const transTypeInput = document.getElementById("trans-type");
const adminActionsEl = document.getElementById("admin-actions");

let allTransactions = [];
let allStudents = [];
let adminEmailsList = [ADMIN_EMAIL.toLowerCase()];
let isAdmin = false;

// Controllo Accesso
onAuthStateChanged(auth, (user) => {
    if (user) {
        userNameElement.textContent = user.displayName || user.email.split('@')[0];
        listenToAdmins(user.email.toLowerCase());
        listenToData();
    } else {
        window.location.href = "index.html";
    }
});

logoutBtn.addEventListener("click", () => signOut(auth).then(() => window.location.href = "index.html"));

// GESTIONE PIN ADMIN
if (openAdminPinBtn) {
    openAdminPinBtn.addEventListener("click", () => adminPinModal.classList.remove("hidden"));
}
if (closePinModalBtn) {
    closePinModalBtn.addEventListener("click", () => adminPinModal.classList.add("hidden"));
}
if (closeAdminPanelBtn) {
    closeAdminPanelBtn.addEventListener("click", () => adminCard.style.display = "none");
}

if (pinForm) {
    pinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (adminPinInput.value === ADMIN_PIN) {
            adminPinModal.classList.add("hidden");
            adminCard.style.display = "block";
            adminPinInput.value = "";
            adminCard.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("PIN errato!");
            adminPinInput.value = "";
        }
    });
}

// ASCOLTA LISTA ADMIN DA FIRESTORE
function listenToAdmins(currentUserEmail) {
    onSnapshot(collection(db, "admins"), (snapshot) => {
        adminEmailsList = [ADMIN_EMAIL.toLowerCase()];
        if (adminsListEl) adminsListEl.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.email) {
                adminEmailsList.push(data.email.toLowerCase());
            }
        });

        if (adminEmailsList.includes(currentUserEmail)) {
            isAdmin = true;
            userRoleElement.textContent = "Admin 👑";
            userRoleElement.className = "role-badge admin-badge";
            
            if (adminActionsEl) adminActionsEl.style.display = "flex";
            if (addStudentForm) addStudentForm.style.display = "flex";
            if (openNoticeModalBtn) openNoticeModalBtn.style.display = "inline-flex";
            if (openCollectionBtn) openCollectionBtn.style.display = "inline-flex";
            if (openAdminPinBtn) openAdminPinBtn.style.display = "inline-flex";
        } else {
            isAdmin = false;
            userRoleElement.textContent = "Studente 🎒";
            userRoleElement.className = "role-badge student-badge";
            if (adminCard) adminCard.style.display = "none";
            if (openAdminPinBtn) openAdminPinBtn.style.display = "none";
        }

        if (adminsListEl && isAdmin) {
            // Tessera Proprietario Migliorata
            const mainLi = document.createElement("li");
            mainLi.className = "student-card-item admin-card-item owner-item";
            mainLi.innerHTML = `
                <div class="admin-info-box">
                    <span class="admin-role">👑 Proprietario</span>
                    <span class="admin-email">${ADMIN_EMAIL}</span>
                </div>
            `;
            adminsListEl.appendChild(mainLi);

            // Tessere Altri Admin Migliorate
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                data.id = docSnap.id;

                const li = document.createElement("li");
                li.className = "student-card-item admin-card-item";
                li.innerHTML = `
                    <div class="admin-info-box">
                        <span class="admin-role">🔑 Amministratore</span>
                        <span class="admin-email">${data.email}</span>
                    </div>
                    <button class="delete-student-btn delete-admin-btn" data-id="${data.id}">&times;</button>
                `;
                adminsListEl.appendChild(li);
            });

            document.querySelectorAll(".delete-admin-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    if (confirm("Rimuovere i permessi da Admin a questo utente?")) {
                        await deleteDoc(doc(db, "admins", id));
                    }
                });
            });
        }
    });
}

// AGGIUNGI NUOVO ADMIN
if (addAdminForm) {
    addAdminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const newAdminEmail = adminEmailInput.value.trim().toLowerCase();
        if (!newAdminEmail) return;

        try {
            await addDoc(collection(db, "admins"), {
                email: newAdminEmail,
                addedBy: auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            adminEmailInput.value = "";
            alert("Nuovo Admin aggiunto con successo!");
        } catch (err) {
            alert("Errore aggiunta Admin: " + err.message);
        }
    });
}

// MODALI HANDLERS
if (openIncomeBtn && openExpenseBtn) {
    openIncomeBtn.addEventListener("click", () => {
        transTypeInput.value = "income";
        modalTitle.textContent = "Aggiungi Quota Singola (Entrata) 📈";
        modal.classList.remove("hidden");
    });
    openExpenseBtn.addEventListener("click", () => {
        transTypeInput.value = "expense";
        modalTitle.textContent = "Registra Spesa (Uscita) 📉";
        modal.classList.remove("hidden");
    });
}
if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

if (openNoticeModalBtn) openNoticeModalBtn.addEventListener("click", () => noticeModal.classList.remove("hidden"));
if (closeNoticeModalBtn) closeNoticeModalBtn.addEventListener("click", () => noticeModal.classList.add("hidden"));

if (openCollectionBtn) openCollectionBtn.addEventListener("click", () => collectionModal.classList.remove("hidden"));
if (closeCollectionModalBtn) closeCollectionModalBtn.addEventListener("click", () => collectionModal.classList.add("hidden"));

// PUBBLICAZIONE AVVISO
if (addNoticeForm) {
    addNoticeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const title = noticeTitleInput.value.trim();
        const desc = noticeDescInput.value.trim();
        if (!title || !desc) return;

        try {
            await addDoc(collection(db, "notices"), {
                title: title,
                desc: desc,
                pinned: false,
                author: auth.currentUser.displayName || auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            noticeTitleInput.value = "";
            noticeDescInput.value = "";
            noticeModal.classList.add("hidden");
        } catch (err) {
            alert("Errore pubblicazione avviso: " + err.message);
        }
    });
}

// AGGIUNTA STUDENTE
if (addStudentForm) {
    addStudentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
        const name = studentNameInput.value.trim();
        if (!name) return;

        try {
            await addDoc(collection(db, "students"), { name: name });
            studentNameInput.value = "";
        } catch (err) {
            alert("Errore aggiunta studente: " + err.message);
        }
    });
}

// CREAZIONE RACCOLTA
if (collectionForm) {
    collectionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const title = document.getElementById("coll-title").value.trim();
        const amount = parseFloat(document.getElementById("coll-amount").value);

        try {
            await addDoc(collection(db, "collections"), {
                title: title,
                amountPerStudent: amount,
                paidStudents: [],
                createdAt: serverTimestamp()
            });

            collectionForm.reset();
            collectionModal.classList.add("hidden");
        } catch (err) {
            alert("Errore creazione raccolta: " + err.message);
        }
    });
}

// TRANSAZIONE SINGOLA
if (transactionForm) {
    transactionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!isAdmin) return;

        const desc = document.getElementById("trans-desc").value;
        const amount = parseFloat(document.getElementById("trans-amount").value);
        const category = document.getElementById("trans-category").value;
        const type = transTypeInput.value;

        try {
            await addDoc(collection(db, "transactions"), {
                description: desc,
                amount: amount,
                category: category,
                type: type,
                author: auth.currentUser.displayName || auth.currentUser.email,
                createdAt: serverTimestamp()
            });

            transactionForm.reset();
            modal.classList.add("hidden");
        } catch (err) {
            alert("Errore salvataggio: " + err.message);
        }
    });
}

// ASCOLTA E SINCRONIZZA TUTTI I DATI
function listenToData() {
    // 1. Ascolta Avvisi (ordinati con i fissati in alto)
    const qNotices = query(collection(db, "notices"), orderBy("pinned", "desc"), orderBy("createdAt", "desc"));
    onSnapshot(qNotices, (snapshot) => {
        noticesListEl.innerHTML = "";
        if (snapshot.empty) {
            noticesListEl.innerHTML = `<li class="empty-state">Nessuna comunicazione presente.</li>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;

            const li = document.createElement("li");
            li.className = `notice-item ${data.pinned ? 'pinned-notice' : ''}`;
            
            const pinBtn = isAdmin ? `<button class="pin-notice-btn ${data.pinned ? 'active-pin' : ''}" data-id="${data.id}" data-pinned="${data.pinned}">${data.pinned ? '📌 Fissato' : '📍 Fissa'}</button>` : '';
            const deleteBtn = isAdmin ? `<button class="delete-btn delete-notice-btn" data-id="${data.id}">&times;</button>` : '';

            li.innerHTML = `
                <div class="notice-body">
                    <div class="notice-header-title">
                        <h4>${data.pinned ? '📌 ' : ''}${data.title}</h4>
                        ${pinBtn}
                    </div>
                    <p class="notice-desc">${data.desc}</p>
                    <div class="trans-meta">Pubblicato da ${data.author}</div>
                </div>
                ${deleteBtn}
            `;
            noticesListEl.appendChild(li);
        });

        if (isAdmin) {
            document.querySelectorAll(".pin-notice-btn").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    const isPinned = e.target.getAttribute("data-pinned") === "true";
                    await updateDoc(doc(db, "notices", id), { pinned: !isPinned });
                });
            });

            document.querySelectorAll(".delete-notice-btn").forEach((btn) => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    if (confirm("Eliminare questa comunicazione?")) {
                        await deleteDoc(doc(db, "notices", id));
                    }
                });
            });
        }
    });

    // 2. Ascolta Studenti
    const qStudents = query(collection(db, "students"), orderBy("name", "asc"));
    onSnapshot(qStudents, (snapshot) => {
        allStudents = [];
        studentsListEl.innerHTML = "";
        snapshot.forEach(docSnap => {
            let data = docSnap.data();
            data.id = docSnap.id;
            allStudents.push(data);
        });

        studentsCountEl.textContent = allStudents.length;

        if (allStudents.length === 0) {
            studentsListEl.innerHTML = `<li class="empty-state">Nessun studente inserito.</li>`;
        } else {
            allStudents.forEach(st => {
                const li = document.createElement("li");
                li.className = "student-card-item";
                const deleteBtn = isAdmin ? `<button class="delete-student-btn" data-id="${st.id}">&times;</button>` : '';
                li.innerHTML = `<span>👤 ${st.name}</span> ${deleteBtn}`;
                studentsListEl.appendChild(li);
            });

            if (isAdmin) {
                document.querySelectorAll(".delete-student-btn").forEach(btn => {
                    btn.addEventListener("click", async (e) => {
                        const id = e.target.getAttribute("data-id");
                        if (confirm("Vuoi rimuovere questo studente dalla classe?")) {
                            await deleteDoc(doc(db, "students", id));
                        }
                    });
                });
            }
        }
    });

    // 3. Ascolta Raccolte Quote
    const qCollections = query(collection(db, "collections"), orderBy("createdAt", "desc"));
    onSnapshot(qCollections, (snapshot) => {
        collectionsContainer.innerHTML = "";
        if (snapshot.empty) {
            collectionsContainer.innerHTML = `<p class="empty-state">Nessuna raccolta attiva al momento.</p>`;
            return;
        }

        snapshot.forEach(docSnap => {
            const coll = docSnap.data();
            coll.id = docSnap.id;
            const paidList = coll.paidStudents || [];

            const card = document.createElement("div");
            card.className = "glass-card collection-card";

            let studentsChecklistHtml = '';
            
            allStudents.forEach(st => {
                const hasPaid = paidList.includes(st.name);
                const badgeClass = hasPaid ? "paid-status" : "unpaid-status";
                const textStatus = hasPaid ? "PAGATO ✅" : "DA PAGARE ❌";
                
                const actionClick = isAdmin ? `data-collid="${coll.id}" data-student="${st.name}" data-paid="${hasPaid}"` : '';

                studentsChecklistHtml += `
                    <div class="student-pay-row ${actionClick ? 'clickable-row' : ''}" ${actionClick}>
                        <span>${st.name}</span>
                        <span class="pay-badge ${badgeClass}">${textStatus}</span>
                    </div>
                `;
            });

            const totalCollected = paidList.length * coll.amountPerStudent;
            const totalTarget = allStudents.length * coll.amountPerStudent;

            const deleteCollBtn = isAdmin ? `<button class="delete-btn delete-coll-btn" data-id="${coll.id}">&times;</button>` : '';

            card.innerHTML = `
                <div class="coll-header">
                    <div>
                        <h4>${coll.title}</h4>
                        <span class="trans-meta">Quota: <strong>€ ${coll.amountPerStudent.toFixed(2)}</strong> per studente</span>
                    </div>
                    ${deleteCollBtn}
                </div>
                <div class="coll-progress">
                    <p>Raccolti: <strong>€ ${totalCollected.toFixed(2)}</strong> / € ${totalTarget.toFixed(2)} (${paidList.length}/${allStudents.length} studenti)</p>
                </div>
                <div class="students-pay-list">
                    ${studentsChecklistHtml || '<p class="empty-state">Aggiungi prima gli studenti alla classe!</p>'}
                </div>
            `;

            collectionsContainer.appendChild(card);
        });

        if (isAdmin) {
            document.querySelectorAll(".student-pay-row.clickable-row").forEach(row => {
                row.addEventListener("click", async (e) => {
                    const target = e.currentTarget;
                    const collId = target.getAttribute("data-collid");
                    const studentName = target.getAttribute("data-student");
                    const isPaid = target.getAttribute("data-paid") === "true";

                    const collRef = doc(db, "collections", collId);

                    if (isPaid) {
                        await updateDoc(collRef, { paidStudents: arrayRemove(studentName) });
                    } else {
                        await updateDoc(collRef, { paidStudents: arrayUnion(studentName) });
                        
                        const collDoc = snapshot.docs.find(d => d.id === collId).data();
                        await addDoc(collection(db, "transactions"), {
                            description: `Quota ${collDoc.title} - ${studentName}`,
                            amount: collDoc.amountPerStudent,
                            category: "Gita",
                            type: "income",
                            author: "Sistema Raccolta",
                            createdAt: serverTimestamp()
                        });
                    }
                });
            });

            document.querySelectorAll(".delete-coll-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    if (confirm("Eliminare questa raccolta?")) {
                        await deleteDoc(doc(db, "collections", id));
                    }
                });
            });
        }
    });

    // 4. Ascolta Transazioni Cassa
    const qTransactions = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    onSnapshot(qTransactions, (snapshot) => {
        allTransactions = [];
        let totalIncome = 0;
        let totalExpense = 0;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            allTransactions.push(data);

            if (data.type === "income") totalIncome += data.amount;
            else totalExpense += data.amount;
        });

        const balance = totalIncome - totalExpense;

        totalBalanceEl.textContent = `€ ${balance.toFixed(2)}`;
        totalIncomeEl.textContent = `+ € ${totalIncome.toFixed(2)}`;
        totalExpenseEl.textContent = `- € ${totalExpense.toFixed(2)}`;

        applyFilters();
    });
}

// FILTRI AVANZATI SUI MOVIMENTI
function applyFilters() {
    const term = searchInput ? searchInput.value.toLowerCase() : "";
    const cat = filterCategory ? filterCategory.value : "ALL";
    const type = filterType ? filterType.value : "ALL";

    const filtered = allTransactions.filter(t => {
        const matchesTerm = t.description.toLowerCase().includes(term) || t.category.toLowerCase().includes(term);
        const matchesCat = cat === "ALL" || t.category === cat;
        const matchesType = type === "ALL" || t.type === type;
        return matchesTerm && matchesCat && matchesType;
    });

    renderTransactions(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (filterCategory) filterCategory.addEventListener("change", applyFilters);
if (filterType) filterType.addEventListener("change", applyFilters);

// RENDER MOVIMENTI
function renderTransactions(list) {
    transactionsListEl.innerHTML = "";

    if (list.length === 0) {
        transactionsListEl.innerHTML = `<li class="empty-state">Nessun movimento trovato.</li>`;
        return;
    }

    list.forEach((item) => {
        const li = document.createElement("li");
        li.className = "transaction-item";

        const isIncome = item.type === "income";
        const sign = isIncome ? "+" : "-";
        const amountClass = isIncome ? "text-success" : "text-danger";
        const deleteBtnHtml = isAdmin ? `<button class="delete-btn" data-id="${item.id}">&times;</button>` : ``;

        li.innerHTML = `
            <div class="trans-info">
                <strong>${item.description}</strong>
                <span class="trans-meta"><span class="badge">${item.category}</span> • ${item.author || 'Admin'}</span>
            </div>
            <div class="trans-amount-container">
                <span class="${amountClass} trans-amount">${sign} € ${item.amount.toFixed(2)}</span>
                ${deleteBtnHtml}
            </div>
        `;

        transactionsListEl.appendChild(li);
    });

    if (isAdmin) {
        document.querySelectorAll(".delete-btn:not(.delete-student-btn):not(.delete-coll-btn):not(.delete-notice-btn)").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.getAttribute("data-id");
                if (confirm("Vuoi eliminare questa voce dal bilancio?")) {
                    await deleteDoc(doc(db, "transactions", id));
                }
            });
        });
    }
}

// GENERAZIONE ESPORTAZIONE REPORT IN PDF
if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", () => {
        const { jsPDF } = window.jspdf;
        const docPdf = new jsPDF();

        const primaryColor = [0, 210, 255];
        const successColor = [46, 204, 113];
        const dangerColor = [231, 76, 60];
        const textColor = [51, 51, 51];

        docPdf.setFont("helvetica", "bold");
        docPdf.setFontSize(22);
        docPdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        docPdf.text("Report Ufficiale Fondo Classe", 14, 22);

        docPdf.setFont("helvetica", "normal");
        docPdf.setFontSize(10);
        docPdf.setTextColor(120, 120, 120);
        const dateStr = new Date().toLocaleDateString('it-IT');
        const timeStr = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        docPdf.text(`Generato il: ${dateStr} alle ore ${timeStr}`, 14, 30);

        docPdf.setDrawColor(220, 220, 220);
        docPdf.line(14, 35, 196, 35);

        docPdf.setFontSize(12);
        docPdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        docPdf.setFont("helvetica", "bold");
        docPdf.text("Riepilogo Finanziario:", 14, 45);

        docPdf.setFont("helvetica", "normal");
        docPdf.text("Saldo Attuale:", 14, 53);
        docPdf.setFont("helvetica", "bold");
        docPdf.text(`${totalBalanceEl.textContent}`, 45, 53);

        docPdf.setFont("helvetica", "normal");
        docPdf.text("Totale Entrate:", 14, 60);
        docPdf.setTextColor(successColor[0], successColor[1], successColor[2]);
        docPdf.text(`${totalIncomeEl.textContent}`, 45, 60);

        docPdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        docPdf.text("Totale Uscite:", 100, 60);
        docPdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
        docPdf.text(`${totalExpenseEl.textContent}`, 130, 60);

        const tableRows = [];
        allTransactions.forEach(t => {
            const sign = t.type === 'income' ? '+' : '-';
            tableRows.push([
                t.description,
                t.category,
                `${sign} € ${t.amount.toFixed(2)}`,
                t.author || 'Admin'
            ]);
        });

        docPdf.autoTable({
            startY: 70,
            head: [['Descrizione', 'Categoria', 'Importo', 'Registrato da']],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] },
            styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
            columnStyles: { 0: { cellWidth: 60 }, 2: { halign: 'right', fontStyle: 'bold' } },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.raw.includes('+')) data.cell.styles.textColor = successColor;
                    else if (data.cell.raw.includes('-')) data.cell.styles.textColor = dangerColor;
                }
            }
        });

        const pageCount = docPdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            docPdf.setPage(i);
            docPdf.setFontSize(9);
            docPdf.setTextColor(150, 150, 150);
            docPdf.text(`Pagina ${i} di ${pageCount}`, docPdf.internal.pageSize.getWidth() / 2, docPdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        }

        docPdf.save(`Report_Fondo_Classe_${new Date().toISOString().slice(0,10)}.pdf`);
    });
}