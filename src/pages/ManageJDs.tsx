import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const ManageJDs = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: jobDescriptions, isLoading } = useQuery({
    queryKey: ["jobDescriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_descriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job description deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job description",
      });
      console.error("Error deleting job description:", error);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from("job_descriptions")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
      toast({
        title: "Success",
        description: "Job status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job status",
      });
      console.error("Error updating job status:", error);
    },
  });

  const handleEdit = (id: string) => {
    navigate(`/configure-scoring/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this job description?")) {
      deleteJobMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleStatusMutation.mutate({ id, status: currentStatus });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Job Descriptions</h1>
          <Button onClick={() => navigate("/configure-scoring")}>
            Create New Job Description
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Min. Experience</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobDescriptions?.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.minimum_experience} years</TableCell>
                    <TableCell>
                      {new Date(job.created_at!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`cursor-pointer ${
                          job.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        onClick={() => handleToggleStatus(job.id, job.status)}
                      >
                        {job.status === 'active' ? (
                          <Check className="h-4 w-4 mr-1 inline" />
                        ) : (
                          <X className="h-4 w-4 mr-1 inline" />
                        )}
                        {job.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(job.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageJDs;