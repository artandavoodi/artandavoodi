/* ARTANDAVOODI · Music context renderer; empty editorial collections stay unpublished. */
import { loadJson } from '../../../../core/data.js?v=9';
import { renderImage, renderLinks, renderIcon } from '../../media.js?v=5';
export async function renderContext(icons) {
  const data = await loadJson('assets/data/music/context.json');
  const sections = data.sections.filter(section => section.items.length).map(record => {
    const section = document.createElement('section');
    const title = document.createElement('h3');
    title.textContent = record.title;
    section.append(title);
    if (record.description) {
      const description = document.createElement('p');
      description.textContent = record.description;
      section.append(description);
    }
    for (const item of record.items) {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = item.title;
      const icon = renderIcon(data.disclosureIcon, icons);
      if (icon) summary.append(icon);
      const description = document.createElement('p');
      description.textContent = item.description || '';
      details.append(summary, description);
      if (item.image) details.append(renderImage(item.image));
      if (item.links) renderLinks(item.links, details);
      section.append(details);
    }
    return section;
  });
  document.querySelector('[data-music-context]').replaceChildren(...sections);
}
