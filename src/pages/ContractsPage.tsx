import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  client: string;
  freelancer: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  endDate?: string;
  description: string;
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'completed' | 'approved';
  dueDate: string;
}

export default function ContractsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Mock contracts data - in real app, this would come from SQL Server
  const mockContracts: Contract[] = [
    {
      id: '1',
      title: 'E-commerce Website Development',
      client: 'TechCorp Solutions',
      freelancer: 'John Doe',
      amount: 2500,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      description: 'Build a modern e-commerce platform with React and Node.js',
      milestones: [
        {
          id: '1-1',
          title: 'Project Setup & Design',
          amount: 500,
          status: 'completed',
          dueDate: '2024-01-25'
        },
        {
          id: '1-2',
          title: 'Frontend Development',
          amount: 1000,
          status: 'pending',
          dueDate: '2024-02-15'
        },
        {
          id: '1-3',
          title: 'Backend & Integration',
          amount: 1000,
          status: 'pending',
          dueDate: '2024-03-10'
        }
      ]
    },
    {
      id: '2',
      title: 'Mobile App Development',
      client: 'StartupXYZ',
      freelancer: 'Jane Smith',
      amount: 3500,
      status: 'completed',
      startDate: '2023-11-01',
      endDate: '2024-01-10',
      description: 'Cross-platform mobile application for food delivery',
      milestones: [
        {
          id: '2-1',
          title: 'App Design & Wireframes',
          amount: 800,
          status: 'approved',
          dueDate: '2023-11-15'
        },
        {
          id: '2-2',
          title: 'Core Functionality',
          amount: 1500,
          status: 'approved',
          dueDate: '2023-12-15'
        },
        {
          id: '2-3',
          title: 'Testing & Deployment',
          amount: 1200,
          status: 'approved',
          dueDate: '2024-01-05'
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-500';
      case 'active':
      case 'pending':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const filteredContracts = mockContracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.freelancer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && contract.status === activeTab;
  });

  if (!user) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your contracts</h1>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage your active and completed contracts</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContracts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'You don\'t have any contracts yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredContracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {contract.title}
                        <Badge variant="outline" className="ml-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(contract.status)} mr-1`} />
                          {contract.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {contract.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${contract.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Value</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {user.userType === 'client' ? 'Freelancer:' : 'Client:'}
                      </span>
                      <span>
                        {user.userType === 'client' ? contract.freelancer : contract.client}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Started:</span>
                      <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                    </div>
                    {contract.endDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {contract.status === 'completed' ? 'Completed:' : 'Due:'}
                        </span>
                        <span>{new Date(contract.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {contract.milestones.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Milestones</h4>
                      <div className="space-y-2">
                        {contract.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(milestone.status)}
                              <div>
                                <div className="font-medium">{milestone.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${milestone.amount.toLocaleString()}</div>
                              <Badge 
                                variant={milestone.status === 'approved' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {milestone.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {contract.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm">
                          Message {user.userType === 'client' ? 'Freelancer' : 'Client'}
                        </Button>
                        {user.userType === 'client' && (
                          <Button size="sm">
                            Release Payment
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}