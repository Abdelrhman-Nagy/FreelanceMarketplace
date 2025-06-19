import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Enhanced authentication hook with role checking
export const useAuth = () => {
  const auth = useAuthContext();
  
  const hasRole = (role: string) => {
    return auth.user?.userType === role;
  };
  
  const isClient = () => hasRole('client');
  const isFreelancer = () => hasRole('freelancer');
  const isAdmin = () => hasRole('admin');
  
  const canAccessResource = (resourceUserId: string) => {
    return auth.user?.id === resourceUserId || isAdmin();
  };
  
  const canManageProject = (project: any) => {
    if (!auth.user) return false;
    
    return (
      project.clientId === auth.user.id ||
      project.freelancerId === auth.user.id ||
      project.members?.some((member: any) => member.userId === auth.user.id) ||
      isAdmin()
    );
  };
  
  const canViewProposals = (jobClientId: string) => {
    return auth.user?.id === jobClientId || isAdmin();
  };
  
  return {
    ...auth,
    hasRole,
    isClient,
    isFreelancer,
    isAdmin,
    canAccessResource,
    canManageProject,
    canViewProposals,
  };
};