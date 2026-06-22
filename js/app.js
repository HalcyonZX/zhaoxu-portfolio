/**
 * 赵旭个人作品集 — 前端逻辑
 * 支持三种内容类型：公众号文章(链接)、视频号视频(视频文件)、策划案(PDF文件)
 */

(function () {
  'use strict';

  // ============ 全局状态 ============
  let contentData = null;
  let currentTab = 'articles';

  // ============ DOM 引用 ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ============ 初始化 ============
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await loadContent();
    renderProfile();
    renderAllSections();
    bindEvents();
    updateStats();
  }

  // ============ 数据加载 ============
  async function loadContent() {
    try {
      const res = await fetch('./data/content.json');
      contentData = await res.json();
    } catch (err) {
      console.error('加载内容数据失败:', err);
      contentData = { profile: { name: '赵旭', title: '内容创作者', bio: '' }, articles: [], videos: [], plans: [] };
    }
  }

  // ============ 个人信息渲染 ============
  function renderProfile() {
    const p = contentData.profile;
    if (p.name) {
      $('#hero-name').textContent = p.name;
      $('#hero-avatar-text').textContent = p.name.charAt(0);
      document.title = p.name + ' — 个人作品集';
    }
    if (p.title) $('#hero-title').textContent = p.title;
    if (p.bio) $('#hero-bio').textContent = p.bio;
    if (p.avatar) {
      const imgEl = $('#hero-avatar-img');
      imgEl.src = p.avatar;
      imgEl.style.display = 'block';
      $('#hero-avatar-text').style.display = 'none';
    }
  }

  // ============ 统计更新 ============
  function updateStats() {
    $('#stat-articles').textContent = contentData.articles.length;
    $('#stat-videos').textContent = contentData.videos.length;
    $('#stat-plans').textContent = contentData.plans.length;
  }


  // ============ 内容渲染 ============
  function renderAllSections() {
    renderArticles();
    renderVideos();
    renderPlans();
  }

  // --- 公众号文章 ---
  function renderArticles() {
    const grid = $('#grid-articles');
    const empty = $('#empty-articles');
    const items = contentData.articles;

    if (!items.length) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'flex';
    empty.style.display = 'none';
    grid.innerHTML = items.map((item) => {
      const coverContent = item.coverImage
        ? '<img src="' + escapeHtml(item.coverImage) + '" alt="' + escapeHtml(item.title) + '">'
        : '📄';
      const dateStr = item.date || '';
      return (
        '<a class="article-card" href="' + escapeHtml(item.url || '#') + '" target="_blank" rel="noopener noreferrer">' +
          '<div class="article-card__cover">' + coverContent + '</div>' +
          '<div class="article-card__body">' +
            '<div class="article-card__date">' + escapeHtml(dateStr) + '</div>' +
            '<div class="article-card__title">' + escapeHtml(item.title) + '</div>' +
            (item.description ? '<div class="article-card__desc">' + escapeHtml(item.description) + '</div>' : '') +
          '</div>' +
          '<span class="article-card__arrow">↗</span>' +
        '</a>'
      );
    }).join('');
  }

  // --- 视频号视频 ---
  function renderVideos() {
    const grid = $('#grid-videos');
    const empty = $('#empty-videos');
    const items = contentData.videos;

    if (!items.length) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = items.map((item, idx) => {
      const coverContent = item.coverImage
        ? '<img src="' + escapeHtml(item.coverImage) + '" alt="' + escapeHtml(item.title) + '">'
        : '';
      return (
        '<div class="video-card" data-video-idx="' + idx + '">' +
          '<div class="video-card__preview">' +
            (coverContent || '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;">🎬</div>') +
            '<div class="video-card__play"></div>' +
            (item.duration ? '<div class="video-card__duration">' + escapeHtml(item.duration) + '</div>' : '') +
          '</div>' +
          '<div class="video-card__body">' +
            '<div class="video-card__title">' + escapeHtml(item.title) + '</div>' +
            '<div class="video-card__date">' + escapeHtml(item.date || '') + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  // --- 策划案 ---
  function renderPlans() {
    const grid = $('#grid-plans');
    const empty = $('#empty-plans');
    const items = contentData.plans;

    if (!items.length) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'flex';
    empty.style.display = 'none';
    grid.innerHTML = items.map((item, idx) => {
      return (
        '<div class="plan-card" data-plan-idx="' + idx + '">' +
          '<div class="plan-card__icon">📋</div>' +
          '<div class="plan-card__body">' +
            '<div class="plan-card__title">' + escapeHtml(item.title) + '</div>' +
            (item.description ? '<div class="plan-card__desc">' + escapeHtml(item.description) + '</div>' : '') +
          '</div>' +
          '<div class="plan-card__meta">' +
            '<div class="plan-card__date">' + escapeHtml(item.date || '') + '</div>' +
            '<div class="plan-card__badge">PDF</div>' +
          '</div>' +
          '<span class="plan-card__arrow">→</span>' +
        '</div>'
      );
    }).join('');
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 标签切换
    $$('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(this.dataset.tab);
      });
    });

    // 导航链接切换
    $$('#nav-links a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var section = this.dataset.section;
        if (section) switchTab(section);
        // 移动端关闭菜单
        $('#nav-links').classList.remove('open');
      });
    });

    // 汉堡菜单
    $('#menu-btn').addEventListener('click', function () {
      $('#nav-links').classList.toggle('open');
    });

    // 视频卡片点击
    $('#grid-videos').addEventListener('click', function (e) {
      var card = e.target.closest('.video-card');
      if (!card) return;
      var idx = parseInt(card.dataset.videoIdx, 10);
      openVideoModal(idx);
    });

    // 策划案卡片点击
    $('#grid-plans').addEventListener('click', function (e) {
      var card = e.target.closest('.plan-card');
      if (!card) return;
      var idx = parseInt(card.dataset.planIdx, 10);
      openPdfModal(idx);
    });

    // 视频弹窗关闭
    $('#video-modal-close').addEventListener('click', closeVideoModal);
    $('#video-modal .modal__overlay').addEventListener('click', closeVideoModal);

    // PDF弹窗关闭
    $('#pdf-modal-close').addEventListener('click', closePdfModal);
    $('#pdf-modal .modal__overlay').addEventListener('click', closePdfModal);

    // ESC 关闭弹窗
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeVideoModal();
        closePdfModal();
      }
    });
  }

  // ============ 标签切换 ============
  function switchTab(tab) {
    currentTab = tab;
    // 更新标签按钮
    $$('.tab-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    // 更新内容区域
    $$('.content-section').forEach(function (section) {
      section.classList.toggle('active', section.id === 'section-' + tab);
    });
    // 更新导航链接
    $$('#nav-links a').forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === tab);
    });
  }

  // ============ 视频弹窗 ============
  function openVideoModal(idx) {
    var item = contentData.videos[idx];
    if (!item) return;

    var player = $('#video-player');
    player.src = item.videoUrl || '';
    $('#video-modal-title').textContent = item.title || '';
    $('#video-modal-desc').textContent = item.description || '';
    $('#video-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
    player.play().catch(function () {});
  }

  function closeVideoModal() {
    var player = $('#video-player');
    player.pause();
    player.src = '';
    $('#video-modal').classList.remove('show');
    document.body.style.overflow = '';
  }

  // ============ PDF 弹窗 ============
  function openPdfModal(idx) {
    var item = contentData.plans[idx];
    if (!item) return;

    var pdfUrl = item.pdfUrl || '';
    $('#pdf-viewer').src = pdfUrl;
    $('#pdf-modal-title').textContent = item.title || '';
    $('#pdf-download-btn').href = pdfUrl;
    $('#pdf-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closePdfModal() {
    $('#pdf-viewer').src = '';
    $('#pdf-modal').classList.remove('show');
    document.body.style.overflow = '';
  }

  // ============ 工具函数 ============
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
