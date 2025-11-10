'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, Users, Loader2 } from 'lucide-react';
import { ApiError } from '@/app/lib/apiError';
import { createStudent } from '@/app/lib/studentApi';

interface Member {
  name: string;
  email: string;
  phone: string;
}

const Register = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { name: '', email: '', phone: '' },
    { name: '', email: '', phone: '' },
  ]);

  const addMember = () => {
    if (members.length < 4) {
      setMembers([...members, { name: '', email: '', phone: '' }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const validateForm = () => {
    if (!teamName.trim()) {
      toast.error('Please enter a team name');
      return false;
    }

    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.name.trim() || !member.email.trim() || !member.phone.trim()) {
        toast.error(`Please complete all fields for member ${i + 1}`);
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) {
        toast.error(`Invalid email for member ${i + 1}`);
        return false;
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(member.phone)) {
        toast.error(`Phone number must be 10 digits for member ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const students = members.map((member, index) => ({
        name: member.name,
        email: member.email,
        phone: member.phone,
        isTeamLeader: index === 0, // First member is team leader
      }));

      const response = await createStudent({
        teamName,
        password,
        students,
      });

      // Success handling
      toast.success('Team registered successfully!');

      router.push('/auth/student/login');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
        if (error.errors && error.errors.length > 0) {
          error.errors.forEach((err) => {
            toast.error(err);
          });
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
        console.error('Registration error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero">
      <Card className="w-full max-w-3xl shadow-large">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Team Registration</CardTitle>
          <CardDescription className="text-base">
            Create your quiz team with 2-4 members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter your team name"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Team Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">Team Members ({members.length}/4)</Label>
                {members.length < 4 && (
                  <Button
                    type="button"
                    onClick={addMember}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Member
                  </Button>
                )}
              </div>

              {members.map((member, index) => (
                <Card key={index} className="p-4 bg-muted">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">
                      Member {index + 1} {index === 0 && '(Team Leader)'}
                    </h4>
                    {members.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeMember(index)}
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`name-${index}`}>Full Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        placeholder="John Doe"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${index}`}>Email</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                      <Input
                        id={`phone-${index}`}
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        placeholder="1234567890"
                        maxLength={10}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register Team'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/student/login')}
                disabled={isLoading}
              >
                Already registered? Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;