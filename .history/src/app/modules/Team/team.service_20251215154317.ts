import { Team } from './team.model';
import { ITeam } from './team.interface';
import QueryBuilder from '../../builder/QueryBuilder';

const createTeamMemberIntoDB = async (payload: ITeam) => {
  const result = await Team.create(payload);
  return result;
};

const getAllTeamMembersFromDB = async (query: Record<string, unknown>) => {
  const teamQuery = new QueryBuilder(Team.find(), query)
    .search(['name', 'designation'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await teamQuery.modelQuery;
  return result;
};

const getSingleTeamMemberFromDB = async (id: string) => {
  const result = await Team.findById(id);
  return result;
};

const updateTeamMemberIntoDB = async (id: string, payload: Partial<ITeam>) => {
  const result = await Team.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteTeamMemberFromDB = async (id: string) => {
  const result = await Team.findByIdAndDelete(id);
  return result;
};

export const TeamService = {
  createTeamMemberIntoDB,
  getAllTeamMembersFromDB,
  getSingleTeamMemberFromDB,
  updateTeamMemberIntoDB,
  deleteTeamMemberFromDB,
};
