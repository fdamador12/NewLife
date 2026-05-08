import React, { useState } from 'react';
import SubLevelScreen from './SubLevelScreen';
import MascotBubble from './components/MascotBubble';
import MultipleChoice from './components/MultipleChoice';
import OpenQuestion from './components/OpenQuestion';
import ReflectivePhrase from './components/ReflectivePhrase';
import CompleteSentence from './components/CompleteSentence';
import { useLevelProgress } from '../../../../hooks/useLevelProgress';
import { useToast } from '../../../../feedback/ToastContext';
import { usePet } from '../../../pet/hooks/usePet';
import { MODULES_CONTENT } from './data/index';
import { StepType } from './data/types';

const MASCOT = require('../../../../assets/images/mascotalibro.png');

type Props = {
    navigation: any;
    level: number;
    sublevel: number;
};

export default function NivelModulo({ navigation, level, sublevel }: Props) {
    const [stepIndex, setStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
    const [advancing, setAdvancing] = useState(false);

    const { progress, advance } = useLevelProgress();
    const { showToast } = useToast();
    const { addXp } = usePet();

    const content = MODULES_CONTENT[level]?.[sublevel];

    if (!content) return null;

    const steps = content.steps;
    const step: StepType = steps[stepIndex];
    const isLast = stepIndex === steps.length - 1;

    const countBefore = (type: StepType, upTo: number) =>
        steps.slice(0, upTo).filter((s: StepType) => s === type).length;

    const currentPhraseIndex = countBefore('phrase', stepIndex);
    const currentChoiceIndex = countBefore('mascot_choice', stepIndex);
    const currentOpenIndex = countBefore('mascot_open', stepIndex);
    const currentSentenceIndex = countBefore('complete_sentence', stepIndex);
    const currentChecklistIndex = countBefore('mascot_checklist', stepIndex);

    const answerKey = `${step}_${countBefore(step, stepIndex)}`;

    const isDisabled =
        (step === 'mascot_choice' && !answers[answerKey]) ||
        (step === 'mascot_open' && !answers[answerKey]?.toString().trim()) ||
        (step === 'complete_sentence' && !answers[answerKey]?.toString().trim()) ||
        (step === 'mascot_checklist' && (!answers[answerKey] || (answers[answerKey] as string[]).length === 0));

    const handleContinue = async () => {
        if (isLast) {
            setAdvancing(true);
            try {
                const isCurrentModule = progress.nivel === level && progress.subnivel === sublevel;

                await advance(level, sublevel);
                console.log('✅ Módulo completado.');

                if (isCurrentModule) {
                    const xpResponse = await addXp('module_complete', level, sublevel);

                    if (xpResponse && xpResponse.evolved) {
                        showToast('¡Módulo completado!', 'success');
                        setTimeout(() => {
                            navigation.navigate('PetEvolution', {
                                newForm: xpResponse.selected_form,
                                xp: xpResponse.xp,
                                destination: 'Path',
                            });
                        }, 1000);
                    } else {
                        const xpMsg = xpResponse && !xpResponse.already_given
                            ? `¡Módulo completado! +${xpResponse.xp_gained} XP`
                            : '¡Módulo completado!';
                        showToast(xpMsg, 'success');
                        setTimeout(() => navigation.navigate('Path'), 1500);
                    }
                } else {
                    showToast('¡Módulo completado!', 'success');
                    setTimeout(() => navigation.navigate('Path'), 1500);
                }

            } catch (error: any) {
                console.log('❌ Error guardando progreso:', error);
                if (!error.response) {
                    showToast('Sin conexión. Verifica tu internet e intenta de nuevo.', 'error');
                } else if (error.response.status === 401) {
                    showToast('Tu sesión expiró. Por favor vuelve a iniciar sesión.', 'error');
                } else {
                    showToast('No se pudo guardar tu progreso. Intenta de nuevo.', 'error');
                }
            } finally {
                setAdvancing(false);
            }
        } else {
            setStepIndex(stepIndex + 1);
        }
    };

    const handleBack = () => {
        if (stepIndex === 0) {
            navigation.navigate('Path');
        } else {
            setStepIndex(stepIndex - 1);
        }
    };

    const renderStep = () => {
        if (step === 'mascot_choice') {
            const data = content.mascot_choice?.[currentChoiceIndex];
            if (!data) return null;
            return (
                <>
                    <MascotBubble text={data.question} />
                    <MultipleChoice
                        options={data.options}
                        selected={answers[answerKey] as string ?? null}
                        onSelect={(val) => setAnswers(prev => ({ ...prev, [answerKey]: val }))}
                    />
                </>
            );
        }

        if (step === 'mascot_open') {
            const data = content.mascot_open?.[currentOpenIndex];
            if (!data) return null;
            return (
                <>
                    <MascotBubble text={data.question} />
                    <OpenQuestion
                        placeholder="Escribe aquí..."
                        value={answers[answerKey] as string ?? ''}
                        onChange={(val) => setAnswers(prev => ({ ...prev, [answerKey]: val }))}
                    />
                </>
            );
        }

        if (step === 'phrase') {
            const data = content.phrase?.[currentPhraseIndex];
            if (!data) return null;
            return <ReflectivePhrase text={data.text} author={data.author} />;
        }

        if (step === 'complete_sentence') {
            const data = content.complete_sentence?.[currentSentenceIndex];
            if (!data) return null;
            return (
                <CompleteSentence
                    prefix={data.prefix}
                    value={answers[answerKey] as string ?? ''}
                    onChange={(val) => setAnswers(prev => ({ ...prev, [answerKey]: val }))}
                />
            );
        }

        if (step === 'mascot_checklist') {
            const data = content.mascot_checklist?.[currentChecklistIndex];
            if (!data) return null;
            return (
                <>
                    <MascotBubble text={data.question} />
                    <MultipleChoice
                        options={data.options}
                        selected={answers[answerKey] as string[] ?? []}
                        onSelect={(val) => {
                            const current = (answers[answerKey] as string[]) ?? [];
                            const updated = current.includes(val)
                                ? current.filter(v => v !== val)
                                : [...current, val];
                            setAnswers(prev => ({ ...prev, [answerKey]: updated }));
                        }}
                        multiple={true}
                    />
                </>
            );
        }

        return null;
    };

    return (
        <SubLevelScreen
            currentStep={stepIndex}
            totalSteps={steps.length - 1}
            moduleNumber={sublevel}
            mascot={MASCOT}
            onBack={handleBack}
            onContinue={handleContinue}
            continueLabel={isLast ? 'Completar módulo' : 'Continuar'}
            showIntro={step === 'intro'}
            introTitle={content.intro.title}
            introDescription={content.intro.description}
            disabled={isDisabled}
            advancing={advancing}
        >
            {renderStep()}
        </SubLevelScreen>
    );
}