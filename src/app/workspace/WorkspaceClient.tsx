"use client";

import { useState, useTransition, useEffect } from "react";
import SheetClient from "../sheet/SheetClient";
import { PlusCircle, Loader2 } from "lucide-react";
import { 
  createWorkspaceTopicAction, 
  createWorkspaceProblemAction,
  deleteWorkspaceTopicAction,
  deleteWorkspaceProblemAction
} from "@/actions/workspace";

type Problem = { id: string; title: string; url: string; platform: string; status: string; starred: boolean };
type Pattern = { id: string; title: string; problems: Problem[] };
type Resource = { id: string; kind: string; title: string; url: string };
type TopicData = { id: string; title: string; resources: Resource[]; patterns: Pattern[] };

export default function WorkspaceClient({
  data,
  totalProblems,
  solvedProblems,
}: {
  data: TopicData[];
  totalProblems: number;
  solvedProblems: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'topic' | 'problem' } | null>(null);

  // Form states
  const [topicTitle, setTopicTitle] = useState("");
  const [qTopicId, setQTopicId] = useState(data.length > 0 ? data[0].id : "");
  const [qTitle, setQTitle] = useState("");
  const [qUrl, setQUrl] = useState("");

  // Ensure qTopicId is always valid
  useEffect(() => {
    if (data.length > 0) {
      if (!qTopicId || !data.find((t) => t.id === qTopicId)) {
        setQTopicId(data[0].id);
      }
    }
  }, [data, qTopicId]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim()) return;
    
    startTransition(async () => {
      try {
        await createWorkspaceTopicAction(topicTitle);
        setTopicTitle("");
        setShowTopicModal(false);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTopicId || !qTitle.trim() || !qUrl.trim()) return;

    startTransition(async () => {
      try {
        await createWorkspaceProblemAction(qTopicId, qTitle, qUrl);
        setQTitle("");
        setQUrl("");
        setShowQuestionModal(false);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteTopic = (topicId: string) => {
    setItemToDelete({ id: topicId, type: 'topic' });
  };

  const handleDeleteProblem = (problemId: string) => {
    setItemToDelete({ id: problemId, type: 'problem' });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    startTransition(async () => {
      try {
        if (itemToDelete.type === 'topic') {
          await deleteWorkspaceTopicAction(itemToDelete.id);
        } else {
          await deleteWorkspaceProblemAction(itemToDelete.id);
        }
        setItemToDelete(null);
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div>
      {/* Workspace Controls */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 leading-tight">
            Your Workspace
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create custom topics and add your own questions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTopicModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Topic
          </button>
          
          <button
            onClick={() => {
              if (data.length > 0 && !qTopicId) setQTopicId(data[0].id);
              setShowQuestionModal(true);
            }}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-semibold text-sm hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={data.length === 0 ? "Create a topic first" : "Add Question"}
          >
            <PlusCircle className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Modals */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-border font-bold text-lg">Create New Topic</div>
            <form onSubmit={handleCreateTopic} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Topic Name</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Dynamic Programming Advanced"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 text-sm font-semibold hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !topicTitle.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-border font-bold text-lg">Add Custom Question</div>
            <form onSubmit={handleAddQuestion} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Topic</label>
                <select
                  required
                  value={qTopicId}
                  onChange={e => setQTopicId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {data.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Question Title</label>
                <input
                  type="text"
                  required
                  value={qTitle}
                  onChange={e => setQTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. Two Sum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Question URL</label>
                <input
                  type="url"
                  required
                  value={qUrl}
                  onChange={e => setQUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 text-sm font-semibold hover:bg-accent rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !qTitle.trim() || !qUrl.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Are you absolutely sure?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {itemToDelete.type === 'topic' 
                ? "This will delete the topic and all questions inside it. This action cannot be undone."
                : "This will permanently delete this question from your workspace."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold hover:bg-accent rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reuse SheetClient for displaying the topics/problems */}
      {data.length > 0 ? (
        <div className="-mt-8">
           <SheetClient 
             data={data} 
             totalProblems={totalProblems} 
             solvedProblems={solvedProblems}
             onDeleteTopic={handleDeleteTopic}
             onDeleteProblem={handleDeleteProblem}
           />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center text-muted-foreground">
          <p>You haven't created any topics in your workspace yet.</p>
          <p className="mt-2 text-sm">Click "New Topic" to get started.</p>
        </div>
      )}
    </div>
  );
}
