(function(){
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DOW = ['Mo','Tu','We','Th','Fr','Sa','Su']; // week starts Monday
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const fmt = d => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  const stripTime = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  class Datepicker{
    constructor(root){
      this.root = root;
      this.input = root.querySelector('input');
      this.mode = root.dataset.mode || 'single';
      this.view = stripTime(new Date());     // month currently shown
      this.selected = null;                   // single
      this.start = null; this.end = null;     // range
      this.overlay = null;                    // 'month' | 'year' | null
      this.build();
      this.bind();
    }

    build(){
      const p = document.createElement('div');
      p.className = 'dp-panel';
      p.setAttribute('role','dialog');
      p.setAttribute('aria-label','Choose date');
      p.innerHTML = `
        <div class="dp-head">
          <button class="dp-nav" data-nav="-1" aria-label="Previous month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button class="dp-title" data-title></button>
          <button class="dp-nav" data-nav="1" aria-label="Next month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="dp-dow" data-dow>${DOW.map(d=>`<span>${d}</span>`).join('')}</div>
        <div class="dp-grid-wrap"><div class="dp-grid" data-grid role="grid"></div></div>
        <div class="dp-overlay" data-overlay></div>
        <div class="dp-foot">
          <button class="dp-btn" data-action="today">Today</button>
          <button class="dp-btn" data-action="clear">Clear</button>
          <button class="dp-btn primary" data-action="close">Done</button>
        </div>`;
      this.root.appendChild(p);
      this.panel = p;
      this.grid = p.querySelector('[data-grid]');
      this.title = p.querySelector('[data-title]');
      this.overlayEl = p.querySelector('[data-overlay]');
      this.dowEl = p.querySelector('[data-dow]');
      this.gridWrap = p.querySelector('.dp-grid-wrap');
    }

    bind(){
      this.input.addEventListener('click', () => this.toggle());
      this.input.addEventListener('keydown', e => {
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); this.toggle(); }
      });
      this.panel.addEventListener('click', e => {
        const nav = e.target.closest('[data-nav]');
        if(nav){ this.shiftMonth(+nav.dataset.nav); return; }
        const cell = e.target.closest('.dp-cell');
        if(cell && !cell.disabled){ this.pick(new Date(+cell.dataset.ts)); return; }
        const title = e.target.closest('[data-title]');
        if(title){ this.toggleOverlay(); return; }
        const opt = e.target.closest('.dp-opt');
        if(opt){ this.pickOverlay(+opt.dataset.val); return; }
        const act = e.target.closest('[data-action]');
        if(act){ this.action(act.dataset.action); return; }
      });
      this.panel.addEventListener('keydown', e => this.keyNav(e));
      document.addEventListener('click', e => {
        if(this.isOpen && !this.root.contains(e.target)) this.close();
      });
      document.addEventListener('keydown', e => { if(e.key==='Escape' && this.isOpen) this.close(); });
    }

    toggle(){ this.isOpen ? this.close() : this.open(); }
    open(){
      this.isOpen = true;
      this.overlay = null;
      if(this.mode==='single' && this.selected) this.view = stripTime(this.selected);
      else if(this.start) this.view = stripTime(this.start);
      this.render();
      this.position();
      this.panel.classList.add('is-open');
      this.root.classList.add('is-open');
    }
    close(){
      this.isOpen = false;
      this.panel.classList.remove('is-open');
      this.root.classList.remove('is-open');
    }

    position(){
      // open below by default; flip above if not enough room
      this.panel.style.top = 'calc(100% + 8px)';
      this.panel.style.bottom = 'auto';
      this.panel.style.left = '0';
      requestAnimationFrame(() => {
        const r = this.panel.getBoundingClientRect();
        if(r.bottom > window.innerHeight - 8 && this.input.getBoundingClientRect().top > r.height){
          this.panel.style.top = 'auto';
          this.panel.style.bottom = 'calc(100% + 8px)';
        }
        if(r.right > window.innerWidth - 8){
          this.panel.style.left = 'auto';
          this.panel.style.right = '0';
        }
      });
    }

    shiftMonth(n){ this.view = new Date(this.view.getFullYear(), this.view.getMonth()+n, 1); this.render(); }

    pick(date){
      if(this.mode==='single'){
        this.selected = date;
        this.sync();
        this.render();
        setTimeout(()=>this.close(), 120);
      } else {
        if(!this.start || (this.start && this.end)){
          this.start = date; this.end = null;
        } else {
          if(date < this.start){ this.end = this.start; this.start = date; }
          else this.end = date;
        }
        this.sync();
        this.render();
      }
    }

    action(a){
      if(a==='today'){
        const t = stripTime(new Date());
        this.view = t;
        if(this.mode==='single') this.pick(t);
        else { this.start = t; this.end = null; this.sync(); this.render(); }
      } else if(a==='clear'){
        this.selected = this.start = this.end = null;
        this.sync(); this.render();
      } else if(a==='close'){
        this.close();
      }
    }

    sync(){
      if(this.mode==='single'){
        this.input.value = this.selected ? fmt(this.selected) : '';
      } else {
        if(this.start && this.end) this.input.value = `${fmt(this.start)} — ${fmt(this.end)}`;
        else if(this.start) this.input.value = `${fmt(this.start)} — …`;
        else this.input.value = '';
      }
      // emit event for integration
      this.root.dispatchEvent(new CustomEvent('datechange', { detail: this.getValue(), bubbles:true }));
    }

    getValue(){
      if(this.mode==='single') return { date: this.selected ? iso(this.selected) : null };
      return { start: this.start ? iso(this.start) : null, end: this.end ? iso(this.end) : null };
    }

    toggleOverlay(){ this.overlay = this.overlay ? null : 'month'; this.render(); }
    pickOverlay(val){
      if(this.overlay==='month'){ this.view = new Date(this.view.getFullYear(), val, 1); this.overlay='year'; }
      else { this.view = new Date(val, this.view.getMonth(), 1); this.overlay=null; }
      this.render();
    }

    render(){
      this.title.textContent = `${MONTHS[this.view.getMonth()]} ${this.view.getFullYear()}`;
      const overlayOn = !!this.overlay;
      this.overlayEl.classList.toggle('is-open', overlayOn);
      this.gridWrap.classList.toggle('is-hidden', overlayOn);
      this.dowEl.classList.toggle('is-hidden', overlayOn);

      if(overlayOn){ this.renderOverlay(); return; }

      const y = this.view.getFullYear(), m = this.view.getMonth();
      const first = new Date(y, m, 1);
      let lead = (first.getDay()+6)%7; // Monday-first offset
      const today = stripTime(new Date());
      const cells = [];
      const startCell = new Date(y, m, 1 - lead);
      for(let i=0;i<42;i++){
        const d = new Date(startCell.getFullYear(), startCell.getMonth(), startCell.getDate()+i);
        const muted = d.getMonth() !== m;
        let cls = 'dp-cell';
        if(muted) cls += ' is-muted';
        if(sameDay(d, today)) cls += ' is-today';
        if(this.mode==='single' && sameDay(d, this.selected)) cls += ' is-selected';
        if(this.mode==='range'){
          if(sameDay(d, this.start)) cls += ' range-start is-selected';
          if(sameDay(d, this.end)) cls += ' range-end is-selected';
          if(this.start && this.end && d > this.start && d < this.end) cls += ' in-range';
        }
        cells.push(`<button class="${cls}" data-ts="${d.getTime()}" role="gridcell" tabindex="${sameDay(d,today)||sameDay(d,this.selected)||sameDay(d,this.start)?0:-1}" aria-label="${fmt(d)}">${d.getDate()}</button>`);
      }
      this.grid.innerHTML = cells.join('');
    }

    renderOverlay(){
      if(this.overlay==='month'){
        this.overlayEl.innerHTML = MONTHS_SHORT.map((mo,i)=>
          `<button class="dp-opt${i===this.view.getMonth()?' is-current':''}" data-val="${i}">${mo}</button>`).join('');
      } else {
        const base = this.view.getFullYear() - 6;
        let html = '';
        for(let i=0;i<12;i++){ const yr = base+i; html += `<button class="dp-opt${yr===this.view.getFullYear()?' is-current':''}" data-val="${yr}">${yr}</button>`; }
        this.overlayEl.innerHTML = html;
      }
    }

    keyNav(e){
      const cell = e.target.closest('.dp-cell');
      if(!cell) return;
      const map = { ArrowLeft:-1, ArrowRight:1, ArrowUp:-7, ArrowDown:7 };
      if(e.key in map){
        e.preventDefault();
        const cur = new Date(+cell.dataset.ts);
        const next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate()+map[e.key]);
        if(next.getMonth() !== this.view.getMonth() || next.getFullYear() !== this.view.getFullYear()){
          this.view = new Date(next.getFullYear(), next.getMonth(), 1);
          this.render();
        }
        const target = this.grid.querySelector(`[data-ts="${next.getTime()}"]`);
        if(target){ target.setAttribute('tabindex','0'); target.focus(); }
      } else if(e.key==='Enter' || e.key===' '){
        e.preventDefault(); this.pick(new Date(+cell.dataset.ts));
      }
    }
  }

  // Initialise every element marked with data-datepicker
  document.querySelectorAll('[data-datepicker]').forEach(el => new Datepicker(el));

  // ===== demo-only theme toggle — safe to delete =====
  const tt = document.getElementById('themeToggle');
  if(tt){
    tt.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const isDark = cur ? cur==='dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    });
  }
})();
