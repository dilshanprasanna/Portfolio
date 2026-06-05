import { useEffect, useMemo, useState } from 'react';

type SkillItem = {
  id: string;
  skillName: string;
  skillIcon: string;
  skillPercentage: number;
  skillLevel: string;
  category: string;
  order: number;
  visible: boolean;
  tags: string[];
};

type SkillCategory = {
  id: string;
  name: string;
  slug: string;
  order: number;
  visible: boolean;
  items: SkillItem[];
};

type SkillsInteractiveProps = {
  categories: SkillCategory[];
};

export default function SkillsInteractive({ categories }: SkillsInteractiveProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [barsReady, setBarsReady] = useState(false);

  const orderedCategories = useMemo(
    () => [...categories].filter((category) => category.visible).sort((a, b) => a.order - b.order),
    [categories]
  );

  const categoryOptions = useMemo(
    () => [
      { label: 'All', value: 'all' },
      ...orderedCategories.map((category) => ({ label: category.name, value: category.slug }))
    ],
    [orderedCategories]
  );

  const flattenedItems = useMemo(
    () =>
      orderedCategories.flatMap((category) =>
        [...category.items]
          .filter((item) => item.visible)
          .sort((a, b) => a.order - b.order)
          .map((item) => ({ ...item, categoryLabel: category.name, categorySlug: category.slug }))
      ),
    [orderedCategories]
  );

  const filteredSkills = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return flattenedItems.filter((skill) => {
      const matchesCategory = activeCategory === 'all' || skill.categorySlug === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        skill.skillName.toLowerCase().includes(normalizedQuery) ||
        skill.categoryLabel.toLowerCase().includes(normalizedQuery) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, flattenedItems, query]);

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('all');
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setBarsReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section id="skills" className="content-section skills-section">
      <div className="section-heading">
        <p className="eyebrow">Skills</p>
        <h2>Capabilities</h2>
        <p>Filter by category, search across tags, and inspect animated proficiency bars.</p>
      </div>

      <div className="skills-toolbar">
        <label className="skills-search" htmlFor="skills-search">
          <span className="skills-search-label">Search</span>
          <input
            id="skills-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search skills, categories, or tags"
          />
        </label>

        <div className="skills-filters" role="tablist" aria-label="Skill categories">
          {categoryOptions.map((category) => (
            <button
              key={category.value}
              type="button"
              className={activeCategory === category.value ? 'is-active' : ''}
              onClick={() => setActiveCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <button type="button" className="skills-reset" onClick={clearFilters}>
          Reset
        </button>
      </div>

      <div className={`skills-grid ${barsReady ? 'is-ready' : ''}`}>
        {filteredSkills.map((skill) => (
          <article key={skill.id} className="skill-card">
            <div className="skill-card-top">
              <div>
                <p className="skill-category">{skill.categoryLabel}</p>
                <h3>{skill.skillName}</h3>
              </div>
              <span className="skill-level">{skill.skillLevel}</span>
            </div>

            <div className="skill-meter" aria-hidden="true">
              <span
                className="skill-meter-fill"
                style={{ width: barsReady ? `${skill.skillPercentage}%` : '0%' }}
              />
            </div>

            <div className="skill-footer">
              <span>{skill.skillPercentage}%</span>
              <div className="skill-tags">
                {skill.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredSkills.length === 0 ? (
        <p className="skills-empty">No skills match the current filter.</p>
      ) : null}
    </section>
  );
}
