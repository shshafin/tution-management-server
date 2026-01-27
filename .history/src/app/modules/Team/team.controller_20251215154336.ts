import { Request, Response } from 'express';
import { TeamService } from './team.service';

import httpStatus from 'http-status';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

const createTeamMember = catchAsync(async (req: Request, res: Response) => {
  if (req.file) {
    const imageName = `team-${Date.now()}`;
    const { secure_url }: any = await sendImageToCloudinary(
      imageName,
      req.file.path,
    );
    req.body.photo = secure_url;
  }

  const result = await TeamService.createTeamMemberIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team member added successfully',
    data: result,
  });
});

const getAllTeamMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamService.getAllTeamMembersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team members retrieved successfully',
    data: result,
  });
});

const getSingleTeamMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeamService.getSingleTeamMemberFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team member retrieved successfully',
    data: result,
  });
});

const updateTeamMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.file) {
    const imageName = `team-${Date.now()}`;
    const { secure_url }: any = await sendImageToCloudinary(
      imageName,
      req.file.path,
    );
    req.body.photo = secure_url;
  }

  const result = await TeamService.updateTeamMemberIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team member updated successfully',
    data: result,
  });
});

const deleteTeamMember = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await TeamService.deleteTeamMemberFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Team member deleted successfully',
    data: null,
  });
});

export const TeamController = {
  createTeamMember,
  getAllTeamMembers,
  getSingleTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
