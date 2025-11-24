import React, { useState } from 'react';
import { Button } from '../../ui/Button';

interface Step2SkillsProps {
  onNext: (data: { skills: string[]; experience: number; languages: string[]; specializations: string[] }) => void;
  onBack: () => void;
}

const Step2Skills: React.FC<Step2SkillsProps> = ({ onNext, onBack }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(5);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  const allSkills = ['TypeScript', 'React', 'Node.js', 'Python', 'Solidity', 'GraphQL', 'Docker', 'AWS'];
  const languages = ['JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'TypeScript', 'Solidity'];
  const specializations = ['Web3', 'Mobile', 'Backend', 'Frontend', 'DevOps', 'Security', 'Data Science', 'AI/ML'];

  const toggleItem = (item: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = () => {
    const data = {
      skills: selectedSkills,
      experience,
      languages: selectedLanguages,
      specializations: selectedSpecializations,
    };
    console.log('Step 2 Data:', data);
    onNext(data);
  };

  return (
    <div className="space-y-8">
      {/* Skills Selection */}
      <div>
        <label className="block text-text-primary font-semibold mb-4">
          Select Skills (max 5)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => selectedSkills.length < 5 && toggleItem(skill, selectedSkills, setSelectedSkills)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedSkills.includes(skill)
                  ? 'bg-gradient-to-r from-primary to-accent text-white'
                  : 'bg-background-card text-text-secondary border border-white/10 hover:border-primary/30'
                }
              `}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-text-primary font-semibold mb-4">
          Years of Experience: <span className="text-accent">{experience}+</span>
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={experience}
          onChange={(e) => setExperience(Number(e.target.value))}
          className="w-full h-2 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent"
        />
        <div className="flex justify-between text-text-secondary text-sm mt-2">
          <span>Beginner</span>
          <span>Expert</span>
        </div>
      </div>

      {/* Programming Languages */}
      <div>
        <label className="block text-text-primary font-semibold mb-4">
          Primary Languages
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedLanguages.includes(lang)
                  ? 'bg-accent text-background'
                  : 'bg-background-card text-text-secondary border border-white/10'
                }
              `}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div>
        <label className="block text-text-primary font-semibold mb-4">
          Specializations
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => toggleItem(spec, selectedSpecializations, setSelectedSpecializations)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${selectedSpecializations.includes(spec)
                  ? 'bg-gradient-to-r from-primary to-accent text-white'
                  : 'bg-background-card text-text-secondary border border-white/10'
                }
              `}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button size="lg" className="flex-1" onClick={handleSubmit}>
          Continue to GitHub →
        </Button>
      </div>
    </div>
  );
};

export { Step2Skills };
