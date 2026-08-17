import re

with open("backend/models/schemas.py", "r") as f:
    content = f.read()

# Replace primary keys
for model in ["ResearchProject", "ResearchPlanItem", "ResearchSource", "ResearchDocument", "Keyword", "Theme", "Finding", "ResearchReport", "UploadedFile", "ResearchTypeModel"]:
    content = re.sub(
        rf"(class {model}\(Base\):\n\s*__tablename__ = \".*?\"\n\n\s*id = Column\()Integer(, primary_key=True)",
        r"\1String\2",
        content
    )

# Replace foreign keys
# project_id
content = re.sub(
    r"(project_id = Column\()Integer(, ForeignKey\(\"research_projects.id\")",
    r"\1String\2",
    content
)
# source_id
content = re.sub(
    r"(source_id = Column\()Integer(, ForeignKey\(\"research_sources.id\")",
    r"\1String\2",
    content
)
# theme_id
content = re.sub(
    r"(theme_id = Column\()Integer(, ForeignKey\(\"themes.id\")",
    r"\1String\2",
    content
)

with open("backend/models/schemas.py", "w") as f:
    f.write(content)

print("Updated schemas.py")
