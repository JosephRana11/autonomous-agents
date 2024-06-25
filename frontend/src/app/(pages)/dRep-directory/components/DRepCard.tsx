'use client';

import { useMemo } from 'react';

import { DRepStatus, IDRep } from '@models/types';
import { TypographyH2 } from '@typography';
import { convertLovelaceToAda } from '@utils';
import { CopyIcon } from 'lucide-react';

import { Badge } from '@app/components/atoms/Badge';
import { Button } from '@app/components/atoms/Button';

const statusColor: Record<DRepStatus, string> = {
    Active: 'text-green-600',
    Inactive: 'text-red-600',
    Retired: 'text-slate-600',
    Yourself: 'text-blue-600'
};

interface DRepCardProps {
    dRep: IDRep;
}

const DRepCard: React.FC<DRepCardProps> = ({ dRep }) => {
    const isDataMissing = dRep.dRepName === null;

    const formattedVotingPower = useMemo(() => {
        return convertLovelaceToAda(dRep.votingPower).toLocaleString('en-Us');
    }, [dRep.votingPower]);

    return (
        <div
            className={`flex w-full items-center justify-between rounded-xl border bg-white p-4 shadow-md ${isDataMissing && 'shadow-bg-red-100 bg-red-100/40'}`}
        >
            <div className="flex space-x-8">
                <div className="flex flex-col space-y-2">
                    <TypographyH2
                        className={`font-semibold ${isDataMissing && 'text-red-600'}`}
                    >
                        {isDataMissing ? 'Data Missing' : dRep.dRepName}
                    </TypographyH2>
                    <div className="flex items-center text-blue-900">
                        <p className="w-80 truncate text-sm font-medium">
                            {dRep.drepId}
                        </p>
                        <CopyIcon className="ml-2 cursor-pointer" size={20} />
                    </div>
                </div>

                <div className="flex w-52 flex-col items-center space-y-2">
                    <p className="text-sm text-gray-800">Voting Power</p>
                    <p className="font-semibold">₳ {formattedVotingPower}</p>
                </div>

                <div className="flex w-52 flex-col items-center space-y-2">
                    <p className="text-sm text-gray-800">Status</p>
                    <Badge className={statusColor[dRep.status]} variant="outline">
                        {dRep.status}
                    </Badge>
                </div>
            </div>

            <Button className="rounded-3xl text-blue-900" variant="outline">
                View Details
            </Button>
        </div>
    );
};

export default DRepCard;
