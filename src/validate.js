function validateResumeData(resumeObj, uiConfig) {
  if (!resumeObj || typeof resumeObj !== 'object') {
    throw new Error('Validatiefout: resume.json bevat geen geldig JSON-object.');
  }

  if (!resumeObj.basics || typeof resumeObj.basics !== 'object') {
    throw new Error('Validatiefout: resume.json mist het verplichte "basics" object.');
  }

  if (!resumeObj.basics.name || typeof resumeObj.basics.name !== 'string') {
    throw new Error('Validatiefout: resume.json mist een geldige "basics.name" string.');
  }

  const arrayFields = [
    'work',
    'projects',
    'skills',
    'certificates',
    'education',
    'languages',
    'publications',
    'interests'
  ];

  for (const field of arrayFields) {
    if (resumeObj[field] !== undefined && !Array.isArray(resumeObj[field])) {
      throw new Error(`Validatiefout in resume.json: "${field}" moet een array zijn, maar is type "${typeof resumeObj[field]}".`);
    }
  }

  if (uiConfig && typeof uiConfig === 'object') {
    if (uiConfig.metrics !== undefined && !Array.isArray(uiConfig.metrics)) {
      throw new Error('Validatiefout in ui-config.json: "metrics" moet een array zijn.');
    }
    if (uiConfig.coachHighlights !== undefined && !Array.isArray(uiConfig.coachHighlights)) {
      throw new Error('Validatiefout in ui-config.json: "coachHighlights" moet een array zijn.');
    }
  }

  return true;
}

module.exports = {
  validateResumeData
};
