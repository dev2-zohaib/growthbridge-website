async function loadBlogPosts() {
  const list = document.getElementById('blog-list');
  const title = document.getElementById('post-title');
  if (!list && !title) return;

  try {
    const response = await fetch(window.GROWTHBRIDGE_CONFIG.blogDataPath);
    if (!response.ok) throw new Error('Unable to load blog content');
    const posts = await response.json();

    if (list) {
      list.innerHTML = posts.map((post) => `
        <article class="card">
          <p class="tag">${post.category}</p>
          <h2>${post.title}</h2>
          <p>${post.excerpt}</p>
          <p class="footer-note">${post.date} • ${post.readingTime}</p>
          <a href="blog-post.html?slug=${post.slug}">Read article</a>
        </article>
      `).join('');
    }

    if (title) {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('slug');
      const post = posts.find((item) => item.slug === slug) || posts[0];
      document.title = `${post.title} | GrowthBridge Blog`;
      document.querySelector('meta[name="description"]').setAttribute('content', post.excerpt);
      title.textContent = post.title;
      document.getElementById('post-meta').textContent = `${post.date} • ${post.readingTime} • ${post.category}`;
      document.getElementById('post-content').innerHTML = `
        <p>${post.intro}</p>
        ${post.sections.map((section) => `
          <section>
            <h2>${section.heading}</h2>
            ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
            ${section.list ? `<ul>${section.list.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
          </section>
        `).join('')}
      `;
    }
  } catch (error) {
    if (list) list.innerHTML = '<article class="card"><h2>Blog content unavailable</h2><p>Please check the JSON data file path or local server configuration.</p></article>';
    if (title) {
      title.textContent = 'Article unavailable';
      document.getElementById('post-content').innerHTML = '<p>Unable to load this article.</p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);
