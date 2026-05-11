// LawBlitz - Indian Constitution & BNS Learning App
// Enhanced JavaScript with better organization and error handling

class LawBlitzApp {
    constructor() {
        this.currentTab = 'constitution';
        this.quizState = {
            questions: [],
            currentIndex: 0,
            score: 0,
            correct: 0,
            wrong: 0,
            answered: [],
            timings: [],
            topic: 'all',
            difficulty: 'easy',
            totalQuestions: 20,
            timePerQuestion: 45,
            timeLeft: 45,
            timerInterval: null,
            questionStart: 0
        };
        this.sfxEnabled = true;
        this.theme = 'dark';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderConstitution();
        this.renderBNS();
        this.renderSchedules();
        this.loadSettings();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Search functionality
        document.getElementById('constSearch').addEventListener('input', (e) => {
            this.renderConstitution(e.target.value.trim());
        });

        document.getElementById('bnsSearch').addEventListener('input', (e) => {
            this.renderBNS(e.target.value.trim());
        });

        // Theme and sound toggles
        document.getElementById('themeBtn').addEventListener('click', () => this.toggleTheme());
        document.getElementById('sfxBtn').addEventListener('click', () => this.toggleSound());

        // Quiz controls
        document.querySelectorAll('#topicSel .q-opt').forEach(btn => {
            btn.addEventListener('click', () => this.selectQuizTopic(btn));
        });

        document.querySelectorAll('#diffSel .q-opt').forEach(btn => {
            btn.addEventListener('click', () => this.selectQuizDifficulty(btn));
        });

        document.getElementById('startQuizBtn').addEventListener('click', () => this.startQuiz());
        document.getElementById('skipQBtn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('quitQBtn').addEventListener('click', () => this.endQuiz());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetQuiz());

        // Keyboard shortcuts for quiz
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchTab(tabName) {
        try {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

            ['constitution', 'bns', 'schedules', 'quiz'].forEach(t => {
                const tabElement = document.getElementById(`tab-${t}`);
                if (tabElement) {
                    tabElement.classList.toggle('hidden', t !== tabName);
                }
            });

            this.currentTab = tabName;
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    renderConstitution(filter = '') {
        try {
            const container = document.getElementById('constList');
            if (!container) return;

            const lowerFilter = filter.toLowerCase();
            let count = 0;
            container.innerHTML = '';

            CONST_PARTS.forEach(part => {
                const filteredArticles = part.articles.filter(article =>
                    !lowerFilter ||
                    article.n.toLowerCase().includes(lowerFilter) ||
                    article.t.toLowerCase().includes(lowerFilter) ||
                    part.name.toLowerCase().includes(lowerFilter) ||
                    part.num.toLowerCase().includes(lowerFilter)
                );

                if (filter && filteredArticles.length === 0) return;
                count += filteredArticles.length;

                const partDiv = this.createPartElement(part, filteredArticles, filter);
                container.appendChild(partDiv);
            });

            document.getElementById('constCount').textContent = filter ? `${count} found` : '';
        } catch (error) {
            console.error('Error rendering constitution:', error);
        }
    }

    createPartElement(part, articles, filter) {
        const partDiv = document.createElement('div');
        partDiv.style.marginBottom = '4px';

        const header = document.createElement('div');
        header.className = `part-header${filter ? ' open' : ''}`;
        header.innerHTML = `
            <span class="part-num">${part.num}</span>
            <span class="part-name">${part.name}</span>
            <span class="part-articles">${part.arts}</span>
            <span class="part-chevron">▼</span>
        `;

        const list = document.createElement('div');
        list.className = `articles-list${filter ? '' : ' hidden'}`;

        articles.forEach(article => {
            const row = this.createArticleRow(article, filter);
            list.appendChild(row);
        });

        header.addEventListener('click', () => {
            header.classList.toggle('open');
            list.classList.toggle('hidden');
        });

        partDiv.appendChild(header);
        partDiv.appendChild(list);
        return partDiv;
    }

    createArticleRow(article, filter) {
        const row = document.createElement('div');
        const lowerFilter = filter.toLowerCase();
        const isHighlighted = filter && (
            article.n.toLowerCase().includes(lowerFilter) ||
            article.t.toLowerCase().includes(lowerFilter)
        );

        row.className = `art-row${isHighlighted ? ' highlight' : ''}`;

        let tagHtml = '';
        if (article.tag === 'fr') tagHtml = '<span class="art-tag tag-fr">FR</span>';
        else if (article.tag === 'dp') tagHtml = '<span class="art-tag tag-dp">DPSP</span>';
        else if (article.tag === 'em') tagHtml = '<span class="art-tag tag-em">Emergency</span>';
        else if (article.tag === 'rep') tagHtml = '<span class="art-tag tag-rep">Repealed</span>';

        if (article.key) tagHtml += '<span class="art-tag tag-key">KEY</span>';

        row.innerHTML = `
            <span class="art-num">Art. ${article.n}</span>
            <span class="art-title">${article.t}${tagHtml}</span>
        `;

        return row;
    }

    renderBNS(filter = '') {
        try {
            const container = document.getElementById('bnsList');
            if (!container) return;

            const lowerFilter = filter.toLowerCase();
            let count = 0;
            container.innerHTML = '';

            BNS_CHAPTERS.forEach(chapter => {
                const filteredSections = chapter.sections.filter(section =>
                    !lowerFilter ||
                    section.n.toLowerCase().includes(lowerFilter) ||
                    section.t.toLowerCase().includes(lowerFilter) ||
                    (section.note && section.note.toLowerCase().includes(lowerFilter)) ||
                    chapter.name.toLowerCase().includes(lowerFilter) ||
                    chapter.ch.toLowerCase().includes(lowerFilter)
                );

                if (filter && filteredSections.length === 0) return;
                count += filteredSections.length;

                const chapterDiv = this.createChapterElement(chapter, filteredSections, filter);
                container.appendChild(chapterDiv);
            });

            document.getElementById('bnsCount').textContent = filter ? `${count} found` : '';
        } catch (error) {
            console.error('Error rendering BNS:', error);
        }
    }

    createChapterElement(chapter, sections, filter) {
        const chapterDiv = document.createElement('div');
        chapterDiv.style.marginBottom = '4px';

        const header = document.createElement('div');
        header.className = `ch-header${filter ? ' open' : ''}`;
        header.innerHTML = `
            <span class="ch-num">${chapter.ch}</span>
            <span class="ch-name">${chapter.name}</span>
            <span class="ch-secs">§${chapter.secs}</span>
            <span class="part-chevron" style="color:var(--text3)">▼</span>
        `;

        const list = document.createElement('div');
        list.className = `articles-list${filter ? '' : ' hidden'}`;

        sections.forEach(section => {
            const row = this.createSectionRow(section, filter);
            list.appendChild(row);
        });

        header.addEventListener('click', () => {
            header.classList.toggle('open');
            list.classList.toggle('hidden');
        });

        chapterDiv.appendChild(header);
        chapterDiv.appendChild(list);
        return chapterDiv;
    }

    createSectionRow(section, filter) {
        const row = document.createElement('div');
        const lowerFilter = filter.toLowerCase();
        const isHighlighted = filter && (
            section.n.toLowerCase().includes(lowerFilter) ||
            section.t.toLowerCase().includes(lowerFilter)
        );

        row.className = `sec-row${isHighlighted ? ' highlight' : ''}`;

        const isNew = section.ipc === 'New';
        const newTag = isNew ? '<span class="sec-tag tag-new">NEW</span>' : '';
        const ipcStr = section.ipc && section.ipc !== 'New' ? `<div class="sec-ipc">≈ IPC §${section.ipc}</div>` : '';
        const noteHtml = section.note ? `<div class="sec-note">${section.note}</div>` : '';

        row.innerHTML = `
            <span class="sec-num">§${section.n}</span>
            <div class="sec-body">
                <div class="sec-title">${section.t}${newTag}</div>
                ${noteHtml}
                ${ipcStr}
            </div>
        `;

        return row;
    }

    renderSchedules() {
        try {
            const schedContainer = document.getElementById('schedList');
            const amendContainer = document.getElementById('amendList');

            if (schedContainer) {
                schedContainer.innerHTML = SCHEDULES.map(s => `
                    <div class="sched-row">
                        <div class="sched-num">${s.n} Schedule</div>
                        <div class="sched-title">${s.t}</div>
                        <div class="sched-desc">${s.d}</div>
                    </div>
                `).join('');
            }

            if (amendContainer) {
                amendContainer.innerHTML = AMENDMENTS.map(a => `
                    <div class="sched-row">
                        <div class="sched-num">${a.n}</div>
                        <div class="sched-title">${a.t}</div>
                        <div class="sched-desc">${a.d}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error rendering schedules:', error);
        }
    }

    toggleTheme() {
        try {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            document.body.classList.toggle('light');
            document.getElementById('themeBtn').textContent = this.theme === 'light' ? '🌙' : '☀️';
            this.saveSettings();
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    toggleSound() {
        try {
            this.sfxEnabled = !this.sfxEnabled;
            document.getElementById('sfxBtn').textContent = this.sfxEnabled ? '🔊' : '🔇';
            this.saveSettings();
        } catch (error) {
            console.error('Error toggling sound:', error);
        }
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('lawBlitzSettings') || '{}');
            this.theme = settings.theme || 'dark';
            this.sfxEnabled = settings.sfxEnabled !== false;

            if (this.theme === 'light') {
                document.body.classList.add('light');
                document.getElementById('themeBtn').textContent = '🌙';
            }
            document.getElementById('sfxBtn').textContent = this.sfxEnabled ? '🔊' : '🔇';
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('lawBlitzSettings', JSON.stringify({
                theme: this.theme,
                sfxEnabled: this.sfxEnabled
            }));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    selectQuizTopic(btn) {
        document.querySelectorAll('#topicSel .q-opt').forEach(b => {
            b.style.borderColor = '';
            b.style.background = '';
        });
        btn.style.borderColor = 'var(--accent)';
        btn.style.background = 'rgba(245,158,11,0.1)';
        this.quizState.topic = btn.dataset.topic;
    }

    selectQuizDifficulty(btn) {
        document.querySelectorAll('#diffSel .q-opt').forEach(b => {
            b.style.borderColor = '';
            b.style.background = '';
        });
        btn.style.borderColor = 'var(--accent)';
        btn.style.background = 'rgba(245,158,11,0.1)';
        this.quizState.difficulty = btn.dataset.diff;
    }

    startQuiz() {
        try {
            this.quizState.totalQuestions = parseInt(document.getElementById('qcountSel').value);
            this.quizState.timePerQuestion = parseInt(document.getElementById('timerSel').value);
            this.quizState.currentIndex = 0;
            this.quizState.score = 0;
            this.quizState.correct = 0;
            this.quizState.wrong = 0;
            this.quizState.answered = [];
            this.quizState.timings = [];

            let questionPool = (QUIZ_QB[this.quizState.topic] || QUIZ_QB.all).filter(q =>
                this.quizState.difficulty === 'easy' ? q.diff === 'easy' :
                this.quizState.difficulty === 'medium' ? ['easy', 'medium'].includes(q.diff) : true
            );

            if (questionPool.length === 0) questionPool = QUIZ_QB.all;
            this.quizState.questions = this.shuffleArray(questionPool).slice(0, this.quizState.totalQuestions);

            document.getElementById('quizStart').classList.add('hidden');
            document.getElementById('quizEnd').classList.add('hidden');
            document.getElementById('quizGame').classList.remove('hidden');

            this.renderQuizQuestion();
        } catch (error) {
            console.error('Error starting quiz:', error);
        }
    }

    renderQuizQuestion() {
        if (this.quizState.currentIndex >= this.quizState.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.quizState.questions[this.quizState.currentIndex];
        this.quizState.questionStart = Date.now();

        this.updateQuizStats();

        const topicLabels = {
            fundamental_rights: 'Fundamental Rights',
            dpsp: 'DPSP',
            union: 'Union Govt',
            emergency: 'Emergency',
            amendments: 'Amendments',
            bns_basic: 'BNS Basics',
            bns_offences: 'BNS Offences',
            preamble: 'Preamble & Parts',
            schedules: 'Schedules',
            all: 'General',
            mixed: 'Mixed'
        };

        const meta = document.getElementById('qMeta');
        meta.innerHTML = `
            <span class="quiz-tag" style="background:var(--gold-dim);color:var(--gold);border:1px solid rgba(252,211,77,0.3)">
                ${topicLabels[this.quizState.topic] || this.quizState.topic}
            </span>
            <span class="quiz-tag" style="background:var(--blue-dim);color:var(--blue);border:1px solid rgba(96,165,250,0.3)">
                ${question.diff}
            </span>
        `;

        document.getElementById('qText').textContent = question.q;

        const optsContainer = document.getElementById('qOpts');
        optsContainer.innerHTML = '';

        this.shuffleArray(question.opts).forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'q-opt';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.answerQuestion(opt, question));
            optsContainer.appendChild(btn);
        });

        document.getElementById('qFeedback').className = 'q-feedback';

        if (this.quizState.timePerQuestion > 0) {
            document.getElementById('tbarWrap').classList.remove('hidden');
            this.quizState.timeLeft = this.quizState.timePerQuestion;
            this.updateTimerBar();
            this.startTimer();
        } else {
            document.getElementById('tbarWrap').classList.add('hidden');
        }
    }

    updateQuizStats() {
        document.getElementById('qNum').textContent = `${this.quizState.currentIndex + 1}/${this.quizState.questions.length}`;
        document.getElementById('qScore').textContent = this.quizState.score;
        document.getElementById('qCorrect').textContent = this.quizState.correct;
        document.getElementById('qWrong').textContent = this.quizState.wrong;
    }

    updateTimerBar() {
        const percentage = Math.max(0, (this.quizState.timeLeft / this.quizState.timePerQuestion) * 100);
        const fill = document.getElementById('tbarFill');
        const num = document.getElementById('tbarNum');

        fill.style.width = percentage + '%';
        fill.className = 'tbar-fill' + (percentage < 30 ? ' d' : percentage < 55 ? ' w' : '');
        num.textContent = this.quizState.timeLeft;
        num.className = 'tbar-num' + (percentage < 30 ? ' d' : percentage < 55 ? ' w' : '');
    }

    startTimer() {
        this.clearTimer();
        this.quizState.timerInterval = setInterval(() => {
            this.quizState.timeLeft--;
            this.updateTimerBar();
            if (this.quizState.timeLeft <= 0) {
                this.clearTimer();
                this.answerQuestion('__TIMEOUT__', this.quizState.questions[this.quizState.currentIndex]);
            }
        }, 1000);
    }

    clearTimer() {
        if (this.quizState.timerInterval) {
            clearInterval(this.quizState.timerInterval);
            this.quizState.timerInterval = null;
        }
    }

    answerQuestion(answer, question) {
        this.clearTimer();
        const elapsed = Math.round((Date.now() - this.quizState.questionStart) / 1000);
        this.quizState.timings.push(elapsed);

        const isCorrect = answer === question.a;

        document.querySelectorAll('.q-opt').forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (btn.textContent === question.a) btn.classList.add('correct');
            else if (btn.textContent === answer && !isCorrect) btn.classList.add('wrong');
        });

        const feedback = document.getElementById('qFeedback');
        if (isCorrect) {
            this.quizState.score += 10;
            this.quizState.correct++;
            feedback.textContent = '✓ Correct!';
            feedback.className = 'q-feedback show ok';
        } else {
            this.quizState.wrong++;
            feedback.textContent = answer === '__TIMEOUT__' ? `⏱ Time up! Answer: ${question.a}` : `✗ Correct answer: ${question.a}`;
            feedback.className = 'q-feedback show fail';
        }

        this.quizState.answered.push({
            q: question.q,
            userAns: answer,
            correct: question.a,
            isCorrect
        });

        this.showFlash(isCorrect);
        this.updateQuizStats();

        this.quizState.currentIndex++;
        setTimeout(() => this.renderQuizQuestion(), 1200);
    }

    skipQuestion() {
        const currentQuestion = this.quizState.questions[this.quizState.currentIndex];
        if (currentQuestion) {
            this.answerQuestion('__TIMEOUT__', currentQuestion);
        }
    }

    endQuiz() {
        this.clearTimer();
        document.getElementById('quizGame').classList.add('hidden');
        document.getElementById('quizEnd').classList.remove('hidden');

        const total = this.quizState.answered.length;
        const accuracy = total > 0 ? Math.round((this.quizState.correct / total) * 100) : 0;
        const avgTime = this.quizState.timings.length > 0 ?
            Math.round(this.quizState.timings.reduce((a, b) => a + b, 0) / this.quizState.timings.length) : 0;

        document.getElementById('endEmoji').textContent =
            accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '👍' : '💪';
        document.getElementById('endScore').textContent = this.quizState.score;
        document.getElementById('endMsg').textContent =
            accuracy >= 90 ? 'Outstanding! You know your Constitution!' :
            accuracy >= 70 ? 'Great work! Almost there!' :
            accuracy >= 50 ? 'Good effort! Keep revising!' :
            'Keep studying — law takes patience!';
        document.getElementById('endAcc').textContent = accuracy + '%';
        document.getElementById('endCorrect').textContent = `${this.quizState.correct}/${total}`;
        document.getElementById('endTime').textContent = avgTime + 's';

        this.renderQuizReview();
        this.saveQuizResult();
    }

    renderQuizReview() {
        const reviewList = document.getElementById('reviewList');
        reviewList.innerHTML = this.quizState.answered.slice().reverse().map(answer => `
            <div class="sched-row" style="border-left:3px solid ${answer.isCorrect ? 'var(--green)' : 'var(--red)'};">
                <div class="sched-num">${answer.isCorrect ? '✓' : '✗'}</div>
                <div class="sched-title" style="font-size:12px">${answer.q}</div>
                <div class="sched-desc">Your answer: ${answer.userAns === '__TIMEOUT__' ? '(timed out)' : answer.userAns} | Correct: ${answer.correct}</div>
            </div>
        `).join('');
    }

    saveQuizResult() {
        try {
            const result = {
                score: this.quizState.score,
                accuracy: Math.round((this.quizState.correct / this.quizState.answered.length) * 100),
                topic: this.quizState.topic,
                difficulty: this.quizState.difficulty,
                date: new Date().toLocaleDateString()
            };

            const leaderboard = JSON.parse(localStorage.getItem('lbLaw') || '[]');
            leaderboard.push(result);
            leaderboard.sort((a, b) => b.score - a.score);
            localStorage.setItem('lbLaw', JSON.stringify(leaderboard.slice(0, 10)));
        } catch (error) {
            console.error('Error saving quiz result:', error);
        }
    }

    resetQuiz() {
        document.getElementById('quizEnd').classList.add('hidden');
        document.getElementById('quizStart').classList.remove('hidden');
    }

    showFlash(isCorrect) {
        const flash = document.getElementById('flashEl');
        flash.className = 'flash ' + (isCorrect ? 'ok' : 'fail');
        setTimeout(() => flash.className = 'flash', 500);
    }

    handleKeyboard(e) {
        if (!document.getElementById('quizGame').classList.contains('hidden')) {
            const options = document.querySelectorAll('.q-opt:not([disabled])');
            const key = e.key;
            if (key >= '1' && key <= '4' && options[key - 1]) {
                options[key - 1].click();
            }
        }
    }

    shuffleArray(array) {
        return [...array].sort(() => Math.random() - 0.5);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lawBlitzApp = new LawBlitzApp();
});