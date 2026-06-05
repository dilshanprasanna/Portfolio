import { useMemo, useState } from 'react';

type ProjectMedia = {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  order: number;
  visible: boolean;
};

type ProjectCaseStudy = {
  problemStatement: string;
  research: string;
  planning: string;
  wireframes: string;
  designProcess: string;
  developmentProcess: string;
  challenges: string;
  solutions: string;
  finalResult: string;
  lessonsLearned: string;
  media: ProjectMedia[];
};

type ProjectItem = {
  id: string;
  projectName: string;
  projectSlug: string;
  category: string;
  projectDescription: string;
  detailedDescription: string;
  technologiesUsed: string[];
  githubUrl: string;
  liveDemoUrl: string;
  documentationUrl: string;
  projectStatus: 'Completed' | 'In Progress' | 'Archived' | string;
  statusOptions: string[];
  thumbnail: string;
  bannerImage: string;
  images: string[];
  videos: string[];
  tags: string[];
  featured: boolean;
  visible: boolean;
  order: number;
  caseStudy: ProjectCaseStudy;
};

type ProjectsInteractiveProps = {
  items: ProjectItem[];
};

export default function ProjectsInteractive({ items }: ProjectsInteractiveProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const visibleItems = useMemo(
    () => [...items].filter((item) => item.visible).sort((a, b) => a.order - b.order),
    [items]
  );

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(visibleItems.map((item) => item.category)))],
    [visibleItems]
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return visibleItems.filter((project) => {
      const matchesCategory = activeCategory === 'all' || project.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        project.projectName.toLowerCase().includes(normalizedQuery) ||
        project.projectDescription.toLowerCase().includes(normalizedQuery) ||
        project.category.toLowerCase().includes(normalizedQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        project.technologiesUsed.some((technology) => technology.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, visibleItems]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ??
    filteredProjects[0] ??
    null;

  const caseStudyMedia = selectedProject
    ? [...selectedProject.caseStudy.media]
        .filter((mediaItem) => mediaItem.visible)
        .sort((a, b) => a.order - b.order)
    : [];

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('all');
  };

  return (
    <section id="projects" className="content-section projects-section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Selected Work</h2>
        <p>Filter by category, search across titles and tags, and open a detailed case study view.</p>
      </div>

      <div className="projects-toolbar">
        <label className="projects-search" htmlFor="projects-search">
          <span className="projects-search-label">Search</span>
          <input
            id="projects-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, tags, or technologies"
          />
        </label>

        <div className="projects-filters" role="tablist" aria-label="Project categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? 'is-active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        <button type="button" className="projects-reset" onClick={clearFilters}>
          Reset
        </button>
      </div>

      <div className="projects-layout">
        <div className="projects-grid" role="list" aria-label="Projects grid">
          {filteredProjects.map((project) => (
            <article key={project.id} className={`project-card ${project.featured ? 'is-featured' : ''}`}>
              <button
                type="button"
                className="project-card-select"
                onClick={() => setSelectedProjectId(project.id)}
                aria-label={`Open case study for ${project.projectName}`}
              >
                <img src={project.thumbnail} alt={`${project.projectName} thumbnail`} loading="lazy" decoding="async" />
              </button>

              <div className="project-card-body">
                <div className="project-card-top">
                  <div>
                    <p className="project-category">{project.category}</p>
                    <h3>{project.projectName}</h3>
                  </div>
                  <span className={`project-status status-${project.projectStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                    {project.projectStatus}
                  </span>
                </div>

                <p className="project-description">{project.projectDescription}</p>

                <div className="project-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="project-links">
                  <a href={project.githubUrl} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a href={project.liveDemoUrl} target="_blank" rel="noreferrer">
                    Live Demo
                  </a>
                  <a href={project.documentationUrl} target="_blank" rel="noreferrer">
                    Docs
                  </a>
                </div>

                <button type="button" className="project-case-study-button" onClick={() => setSelectedProjectId(project.id)}>
                  View Case Study
                </button>
              </div>
            </article>
          ))}
        </div>

        {selectedProject ? (
          <aside className="project-case-study" aria-live="polite">
            <div className="project-case-study-header">
              <div>
                <p className="eyebrow">Case Study</p>
                <h3>{selectedProject.projectName}</h3>
                <p>{selectedProject.detailedDescription}</p>
              </div>
              <span className={`project-status status-${selectedProject.projectStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                {selectedProject.projectStatus}
              </span>
            </div>

            <img
              src={selectedProject.bannerImage}
              alt={`${selectedProject.projectName} banner`}
              className="project-banner"
              loading="lazy"
              decoding="async"
            />

            <div className="project-case-sections">
              <section>
                <h4>Problem</h4>
                <p>{selectedProject.caseStudy.problemStatement}</p>
              </section>
              <section>
                <h4>Research</h4>
                <p>{selectedProject.caseStudy.research}</p>
              </section>
              <section>
                <h4>Design Process</h4>
                <p>{selectedProject.caseStudy.designProcess}</p>
              </section>
              <section>
                <h4>Solutions</h4>
                <p>{selectedProject.caseStudy.solutions}</p>
              </section>
              <section>
                <h4>Lessons Learned</h4>
                <p>{selectedProject.caseStudy.lessonsLearned}</p>
              </section>
            </div>

            <div className="project-case-columns">
              <section>
                <h4>Planning</h4>
                <p>{selectedProject.caseStudy.planning}</p>
              </section>
              <section>
                <h4>Wireframes</h4>
                <p>{selectedProject.caseStudy.wireframes}</p>
              </section>
              <section>
                <h4>Development Process</h4>
                <p>{selectedProject.caseStudy.developmentProcess}</p>
              </section>
              <section>
                <h4>Final Result</h4>
                <p>{selectedProject.caseStudy.finalResult}</p>
              </section>
            </div>

            {caseStudyMedia.length > 0 ? (
              <div className="project-case-media">
                {caseStudyMedia.map((mediaItem) =>
                  mediaItem.type === 'image' ? (
                    <img
                      key={mediaItem.id}
                      src={mediaItem.src}
                      alt={mediaItem.alt}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <video key={mediaItem.id} controls preload="none" playsInline>
                      <source src={mediaItem.src} type="video/mp4" />
                    </video>
                  )
                )}
              </div>
            ) : null}

            <div className="project-case-tags">
              {selectedProject.technologiesUsed.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </aside>
        ) : null}
      </div>

      {filteredProjects.length === 0 ? <p className="projects-empty">No projects match the current filter.</p> : null}
    </section>
  );
}
